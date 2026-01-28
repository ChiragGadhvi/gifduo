// gif.js worker - handles GIF encoding in a web worker
// Source: https://github.com/jnordberg/gif.js

(function() {
  var NeuQuant = function(pixels, samplefac) {
    var netsize = 256;
    var prime1 = 499;
    var prime2 = 491;
    var prime3 = 487;
    var prime4 = 503;
    var minpicturebytes = 3 * prime4;
    var maxnetpos = netsize - 1;
    var netbiasshift = 4;
    var ncycles = 100;
    var intbiasshift = 16;
    var intbias = 1 << intbiasshift;
    var gammashift = 10;
    var gamma = 1 << gammashift;
    var betashift = 10;
    var beta = intbias >> betashift;
    var betagamma = intbias << (gammashift - betashift);
    var initrad = netsize >> 3;
    var radiusbiasshift = 6;
    var radiusbias = 1 << radiusbiasshift;
    var initradius = initrad * radiusbias;
    var radiusdec = 30;
    var alphabiasshift = 10;
    var initalpha = 1 << alphabiasshift;
    var alphadec;
    var radbiasshift = 8;
    var radbias = 1 << radbiasshift;
    var alpharadbshift = alphabiasshift + radbiasshift;
    var alpharadbias = 1 << alpharadbshift;

    var thepicture;
    var lengthcount;
    var samplefac;
    var network;
    var netindex;
    var bias;
    var freq;
    var radpower;

    function init() {
      network = [];
      netindex = new Int32Array(256);
      bias = new Int32Array(netsize);
      freq = new Int32Array(netsize);
      radpower = new Int32Array(netsize >> 3);

      for (var i = 0; i < netsize; i++) {
        var v = (i << (netbiasshift + 8)) / netsize;
        network[i] = new Float64Array([v, v, v, 0]);
        freq[i] = intbias / netsize;
        bias[i] = 0;
      }
    }

    function unbiasnet() {
      for (var i = 0; i < netsize; i++) {
        network[i][0] >>= netbiasshift;
        network[i][1] >>= netbiasshift;
        network[i][2] >>= netbiasshift;
        network[i][3] = i;
      }
    }

    function altersingle(alpha, i, b, g, r) {
      network[i][0] -= (alpha * (network[i][0] - b)) / initalpha;
      network[i][1] -= (alpha * (network[i][1] - g)) / initalpha;
      network[i][2] -= (alpha * (network[i][2] - r)) / initalpha;
    }

    function alterneigh(radius, i, b, g, r) {
      var lo = Math.abs(i - radius);
      var hi = Math.min(i + radius, netsize);
      var j = i + 1;
      var k = i - 1;
      var m = 1;

      while (j < hi || k > lo) {
        var a = radpower[m++];
        if (j < hi) {
          var p = network[j++];
          p[0] -= (a * (p[0] - b)) / alpharadbias;
          p[1] -= (a * (p[1] - g)) / alpharadbias;
          p[2] -= (a * (p[2] - r)) / alpharadbias;
        }
        if (k > lo) {
          var p = network[k--];
          p[0] -= (a * (p[0] - b)) / alpharadbias;
          p[1] -= (a * (p[1] - g)) / alpharadbias;
          p[2] -= (a * (p[2] - r)) / alpharadbias;
        }
      }
    }

    function contest(b, g, r) {
      var bestd = ~(1 << 31);
      var bestbiasd = bestd;
      var bestpos = -1;
      var bestbiaspos = bestpos;

      for (var i = 0; i < netsize; i++) {
        var n = network[i];
        var dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
        if (dist < bestd) {
          bestd = dist;
          bestpos = i;
        }
        var biasdist = dist - (bias[i] >> (intbiasshift - netbiasshift));
        if (biasdist < bestbiasd) {
          bestbiasd = biasdist;
          bestbiaspos = i;
        }
        var betafreq = freq[i] >> betashift;
        freq[i] -= betafreq;
        bias[i] += betafreq << gammashift;
      }
      freq[bestpos] += beta;
      bias[bestpos] -= betagamma;
      return bestbiaspos;
    }

    function inxbuild() {
      var previouscol = 0;
      var startpos = 0;

      for (var i = 0; i < netsize; i++) {
        var p = network[i];
        var q = null;
        var smallpos = i;
        var smallval = p[1];

        for (var j = i + 1; j < netsize; j++) {
          q = network[j];
          if (q[1] < smallval) {
            smallpos = j;
            smallval = q[1];
          }
        }
        q = network[smallpos];
        if (i != smallpos) {
          var temp;
          temp = q[0]; q[0] = p[0]; p[0] = temp;
          temp = q[1]; q[1] = p[1]; p[1] = temp;
          temp = q[2]; q[2] = p[2]; p[2] = temp;
          temp = q[3]; q[3] = p[3]; p[3] = temp;
        }
        if (smallval != previouscol) {
          netindex[previouscol] = (startpos + i) >> 1;
          for (var j = previouscol + 1; j < smallval; j++) {
            netindex[j] = i;
          }
          previouscol = smallval;
          startpos = i;
        }
      }
      netindex[previouscol] = (startpos + maxnetpos) >> 1;
      for (var j = previouscol + 1; j < 256; j++) {
        netindex[j] = maxnetpos;
      }
    }

    function learn() {
      var lengthcount = pixels.length;
      var alphadec = 30 + (samplefac - 1) / 3;
      var samplepixels = lengthcount / (3 * samplefac);
      var delta = ~~(samplepixels / ncycles);
      var alpha = initalpha;
      var radius = initradius;

      var rad = radius >> radiusbiasshift;
      if (rad <= 1) rad = 0;
      for (var i = 0; i < rad; i++) {
        radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));
      }

      var step;
      if (lengthcount < minpicturebytes) {
        samplefac = 1;
        step = 3;
      } else if (lengthcount % prime1 !== 0) {
        step = 3 * prime1;
      } else if (lengthcount % prime2 !== 0) {
        step = 3 * prime2;
      } else if (lengthcount % prime3 !== 0) {
        step = 3 * prime3;
      } else {
        step = 3 * prime4;
      }

      var pix = 0;
      for (var i = 0; i < samplepixels; ) {
        var b = (pixels[pix] & 0xff) << netbiasshift;
        var g = (pixels[pix + 1] & 0xff) << netbiasshift;
        var r = (pixels[pix + 2] & 0xff) << netbiasshift;

        var j = contest(b, g, r);

        altersingle(alpha, j, b, g, r);
        if (rad !== 0) alterneigh(rad, j, b, g, r);

        pix += step;
        if (pix >= lengthcount) pix -= lengthcount;

        i++;
        if (delta === 0) delta = 1;
        if (i % delta === 0) {
          alpha -= alpha / alphadec;
          radius -= radius / radiusdec;
          rad = radius >> radiusbiasshift;
          if (rad <= 1) rad = 0;
          for (var k = 0; k < rad; k++) {
            radpower[k] = alpha * (((rad * rad - k * k) * radbias) / (rad * rad));
          }
        }
      }
    }

    function buildColormap() {
      init();
      learn();
      unbiasnet();
      inxbuild();
    }

    function getColormap() {
      var map = [];
      var index = [];
      for (var i = 0; i < netsize; i++) index[network[i][3]] = i;
      var k = 0;
      for (var i = 0; i < netsize; i++) {
        var j = index[i];
        map[k++] = network[j][0];
        map[k++] = network[j][1];
        map[k++] = network[j][2];
      }
      return map;
    }

    function inxsearch(b, g, r) {
      var bestd = 1000;
      var best = -1;
      var i = netindex[g];
      var j = i - 1;

      while (i < netsize || j >= 0) {
        if (i < netsize) {
          var p = network[i];
          var dist = p[1] - g;
          if (dist >= bestd) i = netsize;
          else {
            i++;
            if (dist < 0) dist = -dist;
            var a = p[0] - b; if (a < 0) a = -a;
            dist += a;
            if (dist < bestd) {
              a = p[2] - r; if (a < 0) a = -a;
              dist += a;
              if (dist < bestd) { bestd = dist; best = p[3]; }
            }
          }
        }
        if (j >= 0) {
          var p = network[j];
          var dist = g - p[1];
          if (dist >= bestd) j = -1;
          else {
            j--;
            if (dist < 0) dist = -dist;
            var a = p[0] - b; if (a < 0) a = -a;
            dist += a;
            if (dist < bestd) {
              a = p[2] - r; if (a < 0) a = -a;
              dist += a;
              if (dist < bestd) { bestd = dist; best = p[3]; }
            }
          }
        }
      }
      return best;
    }

    function lookupRGB(b, g, r) {
      var a = inxsearch(b, g, r);
      return a;
    }

    this.buildColormap = buildColormap;
    this.getColormap = getColormap;
    this.lookupRGB = lookupRGB;
  };

  var LZWEncoder = function(width, height, pixels, colorDepth) {
    var EOF = -1;
    var imgW = width;
    var imgH = height;
    var pixAry = pixels;
    var initCodeSize = Math.max(2, colorDepth);
    var curPixel;
    var remaining;
    var curAccum = 0;
    var curBits = 0;
    var masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff, 0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff];
    var BITS = 12;
    var HSIZE = 5003;
    var nBits;
    var maxbits = BITS;
    var maxcode;
    var maxmaxcode = 1 << BITS;
    var htab = [];
    var codetab = [];
    var freeEnt = 0;
    var clearFlg = false;
    var gInitBits;
    var ClearCode;
    var EOFCode;
    var aCount;
    var accum = [];

    function charOut(c, outs) {
      accum[aCount++] = c;
      if (aCount >= 254) flushChar(outs);
    }

    function clearBlock(outs) {
      clearHash(HSIZE);
      freeEnt = ClearCode + 2;
      clearFlg = true;
      output(ClearCode, outs);
    }

    function clearHash(hsize) {
      for (var i = 0; i < hsize; ++i) htab[i] = -1;
    }

    function compress(initBits, outs) {
      var fcode, c, i, ent, disp, hsize_reg, hshift;

      gInitBits = initBits;
      clearFlg = false;
      nBits = gInitBits;
      maxcode = maxCode(nBits);
      ClearCode = 1 << (initBits - 1);
      EOFCode = ClearCode + 1;
      freeEnt = ClearCode + 2;
      aCount = 0;
      ent = nextPixel();
      hshift = 0;
      for (fcode = HSIZE; fcode < 65536; fcode *= 2) ++hshift;
      hshift = 8 - hshift;
      hsize_reg = HSIZE;
      clearHash(hsize_reg);
      output(ClearCode, outs);

      outer_loop: while ((c = nextPixel()) != EOF) {
        fcode = (c << maxbits) + ent;
        i = (c << hshift) ^ ent;
        if (htab[i] === fcode) {
          ent = codetab[i];
          continue;
        } else if (htab[i] >= 0) {
          disp = hsize_reg - i;
          if (i === 0) disp = 1;
          do {
            if ((i -= disp) < 0) i += hsize_reg;
            if (htab[i] === fcode) {
              ent = codetab[i];
              continue outer_loop;
            }
          } while (htab[i] >= 0);
        }
        output(ent, outs);
        ent = c;
        if (freeEnt < maxmaxcode) {
          codetab[i] = freeEnt++;
          htab[i] = fcode;
        } else {
          clearBlock(outs);
        }
      }
      output(ent, outs);
      output(EOFCode, outs);
    }

    function encode(outs) {
      outs.writeByte(initCodeSize);
      remaining = imgW * imgH;
      curPixel = 0;
      compress(initCodeSize + 1, outs);
      outs.writeByte(0);
    }

    function flushChar(outs) {
      if (aCount > 0) {
        outs.writeByte(aCount);
        outs.writeBytes(accum, 0, aCount);
        aCount = 0;
      }
    }

    function maxCode(nBits) {
      return (1 << nBits) - 1;
    }

    function nextPixel() {
      if (remaining === 0) return EOF;
      --remaining;
      var pix = pixAry[curPixel++];
      return pix & 0xff;
    }

    function output(code, outs) {
      curAccum &= masks[curBits];
      if (curBits > 0) curAccum |= code << curBits;
      else curAccum = code;
      curBits += nBits;
      while (curBits >= 8) {
        charOut(curAccum & 0xff, outs);
        curAccum >>= 8;
        curBits -= 8;
      }
      if (freeEnt > maxcode || clearFlg) {
        if (clearFlg) {
          maxcode = maxCode(nBits = gInitBits);
          clearFlg = false;
        } else {
          ++nBits;
          if (nBits == maxbits) maxcode = maxmaxcode;
          else maxcode = maxCode(nBits);
        }
      }
      if (code == EOFCode) {
        while (curBits > 0) {
          charOut(curAccum & 0xff, outs);
          curAccum >>= 8;
          curBits -= 8;
        }
        flushChar(outs);
      }
    }

    this.encode = encode;
  };

  var GIFEncoder = function(width, height) {
    var width = ~~width;
    var height = ~~height;
    var transparent = null;
    var transIndex = 0;
    var repeat = 0;
    var delay = 0;
    var image;
    var pixels;
    var indexedPixels;
    var colorDepth;
    var colorTab;
    var usedEntry = [];
    var palSize = 7;
    var dispose = -1;
    var firstFrame = true;
    var sample = 10;
    var out;

    function setDelay(ms) {
      delay = Math.round(ms / 10);
    }

    function setDispose(code) {
      if (code >= 0) dispose = code;
    }

    function setRepeat(iter) {
      repeat = iter;
    }

    function setTransparent(c) {
      transparent = c;
    }

    function addFrame(imageData) {
      image = imageData;
      getImagePixels();
      analyzePixels();
      if (firstFrame) {
        writeLSD();
        writePalette();
        if (repeat >= 0) writeNetscapeExt();
      }
      writeGraphicCtrlExt();
      writeImageDesc();
      if (!firstFrame) writePalette();
      writePixels();
      firstFrame = false;
    }

    function finish() {
      out.writeByte(0x3b);
    }

    function setQuality(quality) {
      if (quality < 1) quality = 1;
      sample = quality;
    }

    function start() {
      out = new ByteArray();
      out.writeUTFBytes("GIF89a");
    }

    function analyzePixels() {
      var len = pixels.length;
      var nPix = len / 3;
      indexedPixels = new Uint8Array(nPix);
      var nq = new NeuQuant(pixels, sample);
      nq.buildColormap();
      colorTab = nq.getColormap();
      var k = 0;
      for (var i = 0; i < nPix; i++) {
        var index = nq.lookupRGB(
          pixels[k++] & 0xff,
          pixels[k++] & 0xff,
          pixels[k++] & 0xff
        );
        usedEntry[index] = true;
        indexedPixels[i] = index;
      }
      pixels = null;
      colorDepth = 8;
      palSize = 7;
      if (transparent !== null) {
        transIndex = findClosest(transparent);
      }
    }

    function findClosest(c) {
      if (colorTab === null) return -1;
      var r = (c & 0xff0000) >> 16;
      var g = (c & 0x00ff00) >> 8;
      var b = c & 0x0000ff;
      var minpos = 0;
      var dmin = 256 * 256 * 256;
      var len = colorTab.length;
      for (var i = 0; i < len; ) {
        var dr = r - (colorTab[i++] & 0xff);
        var dg = g - (colorTab[i++] & 0xff);
        var db = b - (colorTab[i++] & 0xff);
        var d = dr * dr + dg * dg + db * db;
        var index = i / 3;
        if (usedEntry[index] && d < dmin) {
          dmin = d;
          minpos = index;
        }
      }
      return minpos;
    }

    function getImagePixels() {
      var w = width;
      var h = height;
      pixels = new Uint8Array(w * h * 3);
      var data = image;
      var count = 0;
      for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
          var b = i * w * 4 + j * 4;
          pixels[count++] = data[b];
          pixels[count++] = data[b + 1];
          pixels[count++] = data[b + 2];
        }
      }
    }

    function writeGraphicCtrlExt() {
      out.writeByte(0x21);
      out.writeByte(0xf9);
      out.writeByte(4);
      var transp, disp;
      if (transparent === null) {
        transp = 0;
        disp = 0;
      } else {
        transp = 1;
        disp = 2;
      }
      if (dispose >= 0) disp = dispose & 7;
      disp <<= 2;
      out.writeByte(0 | disp | 0 | transp);
      out.writeShort(delay);
      out.writeByte(transIndex);
      out.writeByte(0);
    }

    function writeImageDesc() {
      out.writeByte(0x2c);
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(width);
      out.writeShort(height);
      if (firstFrame) {
        out.writeByte(0);
      } else {
        out.writeByte(0x80 | palSize);
      }
    }

    function writeLSD() {
      out.writeShort(width);
      out.writeShort(height);
      out.writeByte(0x80 | 0x70 | 0x00 | palSize);
      out.writeByte(0);
      out.writeByte(0);
    }

    function writeNetscapeExt() {
      out.writeByte(0x21);
      out.writeByte(0xff);
      out.writeByte(11);
      out.writeUTFBytes("NETSCAPE2.0");
      out.writeByte(3);
      out.writeByte(1);
      out.writeShort(repeat);
      out.writeByte(0);
    }

    function writePalette() {
      out.writeBytes(colorTab);
      var n = 3 * 256 - colorTab.length;
      for (var i = 0; i < n; i++) out.writeByte(0);
    }

    function writePixels() {
      var enc = new LZWEncoder(width, height, indexedPixels, colorDepth);
      enc.encode(out);
    }

    function stream() {
      return out;
    }

    this.setDelay = setDelay;
    this.setDispose = setDispose;
    this.setRepeat = setRepeat;
    this.setTransparent = setTransparent;
    this.addFrame = addFrame;
    this.finish = finish;
    this.setQuality = setQuality;
    this.start = start;
    this.stream = stream;
  };

  var ByteArray = function() {
    this.data = [];
  };

  ByteArray.prototype.writeByte = function(val) {
    this.data.push(val);
  };

  ByteArray.prototype.writeShort = function(val) {
    this.data.push(val & 0xff);
    this.data.push((val >> 8) & 0xff);
  };

  ByteArray.prototype.writeBytes = function(array, offset, length) {
    offset = offset || 0;
    length = length || array.length;
    for (var i = offset; i < offset + length; i++) {
      this.data.push(array[i]);
    }
  };

  ByteArray.prototype.writeUTFBytes = function(str) {
    for (var i = 0; i < str.length; i++) {
      this.data.push(str.charCodeAt(i));
    }
  };

  ByteArray.prototype.getData = function() {
    return new Uint8Array(this.data);
  };

  // Worker message handler
  self.onmessage = function(event) {
    var data = event.data;
    
    if (data.cmd === 'start') {
      // Process frame
      var encoder = new GIFEncoder(data.width, data.height);
      encoder.setRepeat(0);
      encoder.setDelay(data.delay);
      encoder.setQuality(data.quality);
      encoder.start();
      encoder.addFrame(data.imageData);
      encoder.finish();
      
      var stream = encoder.stream();
      var buffer = stream.getData();
      
      self.postMessage({
        cmd: 'frame',
        data: buffer
      });
    }
  };
})();
