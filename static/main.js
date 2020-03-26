(function () {
  'use strict';

  var pug = (function(exports) {

    var pug_has_own_property = Object.prototype.hasOwnProperty;

    /**
     * Merge two attribute objects giving precedence
     * to values in object `b`. Classes are special-cased
     * allowing for arrays and merging/joining appropriately
     * resulting in a string.
     *
     * @param {Object} a
     * @param {Object} b
     * @return {Object} a
     * @api private
     */

    exports.merge = pug_merge;
    function pug_merge(a, b) {
      if (arguments.length === 1) {
        var attrs = a[0];
        for (var i = 1; i < a.length; i++) {
          attrs = pug_merge(attrs, a[i]);
        }
        return attrs;
      }

      for (var key in b) {
        if (key === 'class') {
          var valA = a[key] || [];
          a[key] = (Array.isArray(valA) ? valA : [valA]).concat(b[key] || []);
        } else if (key === 'style') {
          var valA = pug_style(a[key]);
          valA = valA && valA[valA.length - 1] !== ';' ? valA + ';' : valA;
          var valB = pug_style(b[key]);
          valB = valB && valB[valB.length - 1] !== ';' ? valB + ';' : valB;
          a[key] = valA + valB;
        } else {
          a[key] = b[key];
        }
      }

      return a;
    }
    /**
     * Process array, object, or string as a string of classes delimited by a space.
     *
     * If `val` is an array, all members of it and its subarrays are counted as
     * classes. If `escaping` is an array, then whether or not the item in `val` is
     * escaped depends on the corresponding item in `escaping`. If `escaping` is
     * not an array, no escaping is done.
     *
     * If `val` is an object, all the keys whose value is truthy are counted as
     * classes. No escaping is done.
     *
     * If `val` is a string, it is counted as a class. No escaping is done.
     *
     * @param {(Array.<string>|Object.<string, boolean>|string)} val
     * @param {?Array.<string>} escaping
     * @return {String}
     */
    exports.classes = pug_classes;
    function pug_classes_array(val, escaping) {
      var classString = '', className, padding = '', escapeEnabled = Array.isArray(escaping);
      for (var i = 0; i < val.length; i++) {
        className = pug_classes(val[i]);
        if (!className) continue;
        escapeEnabled && escaping[i] && (className = pug_escape(className));
        classString = classString + padding + className;
        padding = ' ';
      }
      return classString;
    }
    function pug_classes_object(val) {
      var classString = '', padding = '';
      for (var key in val) {
        if (key && val[key] && pug_has_own_property.call(val, key)) {
          classString = classString + padding + key;
          padding = ' ';
        }
      }
      return classString;
    }
    function pug_classes(val, escaping) {
      if (Array.isArray(val)) {
        return pug_classes_array(val, escaping);
      } else if (val && typeof val === 'object') {
        return pug_classes_object(val);
      } else {
        return val || '';
      }
    }

    /**
     * Convert object or string to a string of CSS styles delimited by a semicolon.
     *
     * @param {(Object.<string, string>|string)} val
     * @return {String}
     */

    exports.style = pug_style;
    function pug_style(val) {
      if (!val) return '';
      if (typeof val === 'object') {
        var out = '';
        for (var style in val) {
          /* istanbul ignore else */
          if (pug_has_own_property.call(val, style)) {
            out = out + style + ':' + val[style] + ';';
          }
        }
        return out;
      } else {
        return val + '';
      }
    }
    /**
     * Render the given attribute.
     *
     * @param {String} key
     * @param {String} val
     * @param {Boolean} escaped
     * @param {Boolean} terse
     * @return {String}
     */
    exports.attr = pug_attr;
    function pug_attr(key, val, escaped, terse) {
      if (val === false || val == null || !val && (key === 'class' || key === 'style')) {
        return '';
      }
      if (val === true) {
        return ' ' + (terse ? key : key + '="' + key + '"');
      }
      var type = typeof val;
      if ((type === 'object' || type === 'function') && typeof val.toJSON === 'function') {
        val = val.toJSON();
      }
      if (typeof val !== 'string') {
        val = JSON.stringify(val);
        if (!escaped && val.indexOf('"') !== -1) {
          return ' ' + key + '=\'' + val.replace(/'/g, '&#39;') + '\'';
        }
      }
      if (escaped) val = pug_escape(val);
      return ' ' + key + '="' + val + '"';
    }
    /**
     * Render the given attributes object.
     *
     * @param {Object} obj
     * @param {Object} terse whether to use HTML5 terse boolean attributes
     * @return {String}
     */
    exports.attrs = pug_attrs;
    function pug_attrs(obj, terse){
      var attrs = '';

      for (var key in obj) {
        if (pug_has_own_property.call(obj, key)) {
          var val = obj[key];

          if ('class' === key) {
            val = pug_classes(val);
            attrs = pug_attr(key, val, false, terse) + attrs;
            continue;
          }
          if ('style' === key) {
            val = pug_style(val);
          }
          attrs += pug_attr(key, val, false, terse);
        }
      }

      return attrs;
    }
    /**
     * Escape the given string of `html`.
     *
     * @param {String} html
     * @return {String}
     * @api private
     */

    var pug_match_html = /["&<>]/;
    exports.escape = pug_escape;
    function pug_escape(_html){
      var html = '' + _html;
      var regexResult = pug_match_html.exec(html);
      if (!regexResult) return _html;

      var result = '';
      var i, lastIndex, escape;
      for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
        switch (html.charCodeAt(i)) {
          case 34: escape = '&quot;'; break;
          case 38: escape = '&amp;'; break;
          case 60: escape = '&lt;'; break;
          case 62: escape = '&gt;'; break;
          default: continue;
        }
        if (lastIndex !== i) result += html.substring(lastIndex, i);
        lastIndex = i + 1;
        result += escape;
      }
      if (lastIndex !== i) return result + html.substring(lastIndex, i);
      else return result;
    }
    /**
     * Re-throw the given `err` in context to the
     * the pug in `filename` at the given `lineno`.
     *
     * @param {Error} err
     * @param {String} filename
     * @param {String} lineno
     * @param {String} str original source
     * @api private
     */

    exports.rethrow = pug_rethrow;
    function pug_rethrow(err, filename, lineno, str){
      if (!(err instanceof Error)) throw err;
      if ((typeof window != 'undefined' || !filename) && !str) {
        err.message += ' on line ' + lineno;
        throw err;
      }
      try {
        str = str || require('fs').readFileSync(filename, 'utf8');
      } catch (ex) {
        pug_rethrow(err, null, lineno);
      }
      var context = 3
        , lines = str.split('\n')
        , start = Math.max(lineno - context, 0)
        , end = Math.min(lines.length, lineno + context);

      // Error context
      var context = lines.slice(start, end).map(function(line, i){
        var curr = i + start + 1;
        return (curr == lineno ? '  > ' : '    ')
          + curr
          + '| '
          + line;
      }).join('\n');

      // Alter exception message
      err.path = filename;
      err.message = (filename || 'Pug') + ':' + lineno
        + '\n' + context + '\n\n' + err.message;
      throw err;
    }
    return exports
  })({});

  function q1Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
  ;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
  pug_html = pug_html + "\u003Cbody\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
  pug_html = pug_html + "\u003Ch1\u003E";
  pug_html = pug_html + " ";
  pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
  if (progress) {
  pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
  pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
  }
  pug_html = pug_html + "\u003Cmain\u003E";
  pug_html = pug_html + "\u003Carticle\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cp\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
  if (data) {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q1\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vond je de communicatie van de docenten en docent-assistenten over slack";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  else {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q1\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vond je de communicatie van de docenten en docent-assistenten over slack";
  pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
  pug_html = pug_html + "\u003Cfooter\u003E";
  pug_html = pug_html + "\u003Cdiv\u003E";
  pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fbody\u003E";
  }.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

  function q2Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
  ;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
  pug_html = pug_html + "\u003Cbody\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
  pug_html = pug_html + "\u003Ch1\u003E";
  pug_html = pug_html + " ";
  pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
  if (progress) {
  pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
  pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
  }
  pug_html = pug_html + "\u003Cmain\u003E";
  pug_html = pug_html + "\u003Carticle\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cp\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
  if (data) {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q2\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vond je de digitale colleges over Jitsi";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  else {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q2\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vond je de digitale colleges over Jitsi";
  pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
  pug_html = pug_html + "\u003Cfooter\u003E";
  pug_html = pug_html + "\u003Cdiv\u003E";
  pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fbody\u003E";
  }.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

  function q3Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
  ;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
  pug_html = pug_html + "\u003Cbody\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
  pug_html = pug_html + "\u003Ch1\u003E";
  pug_html = pug_html + " ";
  pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
  if (progress) {
  pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
  pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
  }
  pug_html = pug_html + "\u003Cmain\u003E";
  pug_html = pug_html + "\u003Carticle\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cp\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
  if (data) {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q3\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vond je de digitale colleges over Bongo";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  else {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q3\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vond je de digitale colleges over Bongo";
  pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
  pug_html = pug_html + "\u003Cfooter\u003E";
  pug_html = pug_html + "\u003Cdiv\u003E";
  pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fbody\u003E";
  }.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

  function q4Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
  ;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
  pug_html = pug_html + "\u003Cbody\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
  pug_html = pug_html + "\u003Ch1\u003E";
  pug_html = pug_html + " ";
  pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
  if (progress) {
  pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
  pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
  }
  pug_html = pug_html + "\u003Cmain\u003E";
  pug_html = pug_html + "\u003Carticle\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cp\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
  if (data) {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q4\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vond je de hulp van je mede-studenten tijdens de weken thuis?";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  else {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q4\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vond je de hulp van je mede-studenten tijdens de weken thuis?";
  pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Volgende vraag\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
  pug_html = pug_html + "\u003Cfooter\u003E";
  pug_html = pug_html + "\u003Cdiv\u003E";
  pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fbody\u003E";
  }.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

  function q5Fn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
  ;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
  pug_html = pug_html + "\u003Cbody\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
  pug_html = pug_html + "\u003Ch1\u003E";
  pug_html = pug_html + " ";
  pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
  if (progress) {
  pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
  pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
  }
  pug_html = pug_html + "\u003Cmain\u003E";
  pug_html = pug_html + "\u003Carticle\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cp\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fheader\u003E";
  if (data) {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q5\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vaak heb je gegamed tussendoor?";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade\" min=\"1\" max=\"10\""+pug.attr("value", data.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Afronden\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  else {
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Fquestion\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cinput type=\"hidden\" value=\"q5\" name=\"q\"\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade\"\u003E";
  pug_html = pug_html + " Hoe vaak heb je gegamed tussendoor?";
  pug_html = pug_html + "\u003Cinput id=\"grade\" required type=\"number\" name=\"grade\" min=\"1\" max=\"10\"\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc\" rows=\"4\" wrap=\"hard\" name=\"desc\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Vorige vraag\" name=\"action\"\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Afronden\" name=\"action\"\u003E\u003C\u002Fform\u003E";
  }
  pug_html = pug_html + "\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
  pug_html = pug_html + "\u003Cfooter\u003E";
  pug_html = pug_html + "\u003Cdiv\u003E";
  pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fbody\u003E";
  }.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

  function finishFn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
  ;var locals_for_with = (locals || {});(function (data, pageTitle, progress, uuid) {
  pug_html = pug_html + "\u003Cbody\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
  pug_html = pug_html + "\u003Ch1\u003E";
  pug_html = pug_html + " ";
  pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
  if (progress) {
  pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
  pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
  }
  pug_html = pug_html + "\u003Cmain\u003E";
  pug_html = pug_html + "\u003Carticle\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cp\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
  pug_html = pug_html + "\u003Ch2\u003E";
  pug_html = pug_html + "Afronden\u003C\u002Fh2\u003E";
  pug_html = pug_html + "\u003Cprogress value=\"5\" max=\"5\"\u003E";
  pug_html = pug_html + "5\u002F5\u003C\u002Fprogress\u003E";
  pug_html = pug_html + "\u003Cform method=\"POST\" action=\"\u002Ffinish\"\u003E";
  pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug.attr("value", uuid, true, true)+" name=\"uuid\"") + "\u003E";
  pug_html = pug_html + "\u003Cfieldset name=\"q1\"\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Vraag 1\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade1\"\u003E";
  pug_html = pug_html + " Hoe vond je de communicatie van de docenten en docent-assistenten over slack";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade1\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade1\" min=\"1\" max=\"10\""+pug.attr("value", data.q1.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc1\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc1\" rows=\"4\" wrap=\"hard\" name=\"desc1\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.q1.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset name=\"q2\"\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Vraag 2\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade2\"\u003E";
  pug_html = pug_html + " Hoe vond je de digitale colleges over Jitsi";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade2\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade2\" min=\"1\" max=\"10\""+pug.attr("value", data.q2.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc2\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc2\" rows=\"4\" wrap=\"hard\" name=\"desc2\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.q2.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset name=\"q3\"\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Vraag 3\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade3\"\u003E";
  pug_html = pug_html + " Hoe vond je de digitale colleges over Bongo";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade3\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade3\" min=\"1\" max=\"10\""+pug.attr("value", data.q3.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc3\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc3\" rows=\"4\" wrap=\"hard\" name=\"desc3\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.q3.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset name=\"q4\"\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Vraag 4\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade4\"\u003E";
  pug_html = pug_html + " Hoe vond je de hulp van je mede-studenten tijdens de weken thuis?";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade4\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade4\" min=\"1\" max=\"10\""+pug.attr("value", data.q4.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc4\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc4\" rows=\"4\" wrap=\"hard\" name=\"desc4\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.q4.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset name=\"q5\"\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Vraag 5\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Cijfer\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"grade5\"\u003E";
  pug_html = pug_html + " Hoe vaak heb je gegamed tussendoor?";
  pug_html = pug_html + "\u003Cinput" + (" id=\"grade5\""+pug.attr("required", true, true, true)+" type=\"number\" name=\"grade5\" min=\"1\" max=\"10\""+pug.attr("value", data.q5.grade, true, true)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cfieldset\u003E";
  pug_html = pug_html + "\u003Clegend\u003E";
  pug_html = pug_html + "Beschrijving\u003C\u002Flegend\u003E";
  pug_html = pug_html + "\u003Clabel for=\"desc5\"\u003E";
  pug_html = pug_html + " Zou je hier wat op willen aanmerken?";
  pug_html = pug_html + "\u003Ctextarea id=\"desc5\" rows=\"4\" wrap=\"hard\" name=\"desc5\"\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = data.q5.desc) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E\u003C\u002Flabel\u003E\u003C\u002Ffieldset\u003E\u003C\u002Ffieldset\u003E";
  pug_html = pug_html + "\u003Cinput type=\"submit\" value=\"Afronden\"\u003E\u003C\u002Fform\u003E\u003C\u002Fheader\u003E\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
  pug_html = pug_html + "\u003Cfooter\u003E";
  pug_html = pug_html + "\u003Cdiv\u003E";
  pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fbody\u003E";
  }.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

  function doneFn(locals) {var pug_html = "", pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {};
  ;var locals_for_with = (locals || {});(function (fromBegin, pageTitle, progress, uuid) {
  pug_html = pug_html + "\u003Cbody\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cdiv class=\"title\"\u003E";
  pug_html = pug_html + "\u003Ch1\u003E";
  pug_html = pug_html + " ";
  pug_html = pug_html + (pug.escape(null == (pug_interp = pageTitle) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E";
  if (progress) {
  pug_html = pug_html + "\u003Cprogress" + (pug.attr("value", progress, true, true)+" max=\"6\"") + "\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = progress) ? "" : pug_interp));
  pug_html = pug_html + "\u002F6\u003C\u002Fprogress\u003E";
  }
  pug_html = pug_html + "\u003Cmain\u003E";
  pug_html = pug_html + "\u003Carticle\u003E";
  pug_html = pug_html + "\u003Cheader\u003E";
  pug_html = pug_html + "\u003Cdiv class=\"done\"\u003E";
  pug_html = pug_html + "\u003Cp\u003E";
  pug_html = pug_html + (pug.escape(null == (pug_interp = uuid) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
  pug_html = pug_html + "\u003Cdiv class=\"content\"\u003E";
  if (!fromBegin) {
  pug_html = pug_html + "\u003Ch2\u003E";
  pug_html = pug_html + "Bedankt voor het invullen van de WebDev Minor Enquete over het digitale lesgeven\u003C\u002Fh2\u003E";
  pug_html = pug_html + "\u003Ch3\u003E";
  pug_html = pug_html + "✅\u003C\u002Fh3\u003E";
  pug_html = pug_html + "\u003Ca href=\"\u002F\"\u003E";
  pug_html = pug_html + "Terug naar het begin\u003C\u002Fa\u003E";
  }
  else {
  pug_html = pug_html + "\u003Ch2\u003E";
  pug_html = pug_html + "Je hebt de enquete al eens ingevuld, nogmaals bedankt voor het invullen van de WebDev Minor Enquete over het digitale lesgeven\u003C\u002Fh2\u003E";
  pug_html = pug_html + "\u003Ch3\u003E";
  pug_html = pug_html + "😬\u003C\u002Fh3\u003E";
  pug_html = pug_html + "\u003Ca href=\"\u002F\"\u003E";
  pug_html = pug_html + "Terug naar het begin\u003C\u002Fa\u003E";
  }
  pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E\u003C\u002Farticle\u003E\u003C\u002Fmain\u003E";
  pug_html = pug_html + "\u003Cfooter\u003E";
  pug_html = pug_html + "\u003Cdiv\u003E";
  pug_html = pug_html + "MIT © CMD Amsterdam, docs and images are CC-BY-4.0.\u003C\u002Fdiv\u003E\u003C\u002Ffooter\u003E\u003C\u002Fbody\u003E";
  }.call(this,"fromBegin" in locals_for_with?locals_for_with.fromBegin:typeof fromBegin!=="undefined"?fromBegin:undefined,"pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"progress" in locals_for_with?locals_for_with.progress:typeof progress!=="undefined"?progress:undefined,"uuid" in locals_for_with?locals_for_with.uuid:typeof uuid!=="undefined"?uuid:undefined));} catch (err) {pug.rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);}return pug_html;}

  const templates = {
      q1Fn: q1Fn,
      q2Fn: q2Fn,
      q3Fn: q3Fn,
      q4Fn: q4Fn,
      q5Fn: q5Fn,
      finishFn: finishFn,
      doneFn: doneFn,
  };

  init ( true );

  /**
   *
   */
  function init ( initial = false ) {
      if ( !initial ) {
          handleNetStates ();
      }
      if ( checkStorage () && initial ) {
          throwLoadingState ( () => {
              return getStorage ();
          } )
              .then ( data => {
                  sendData ( data );
                  renderPage ( data );
                  init ( false );
              } );
      } else {
          if ( document.getElementById ( 'begin' ) ) {
              console.log ( 'index Page' );
              document.querySelector ( 'form' ).addEventListener ( 'submit', e => {
                  e.preventDefault ();
                  // console.log(e.target.elements.namedItem('uuid').value);
                  throwLoadingState ( () => {
                      return getAllUserData ( e.target.elements.namedItem ( 'uuid' ).value );
                  } )
                      .then ( data => {
                          storeData ( data );
                          renderPage ( data );
                          init ( false );
                      } );
              }, false );
          } else {
              console.log ( 'Question Page' );
              activatePrevNext ();
              watchForm ();
          }
      }
  }

  function renderPage ( data ) {
      const title = `Vraag ${ data.state[ 1 ] }`;
      if ( data[ data.state ] || data.state === 'finish' ) {
          renderBody ( templates[ `${ data.state }Fn` ] ( {
              title: `${ title } | WebDev Enquete`,
              pageTitle: title,
              progress: data.state.substring ( 1 ),
              uuid: data.uuid,
              data: data[ data.state ]
          } ) );
      } else if ( data.state === 'done' ) {
          renderBody ( templates[ `${ data.state }Fn` ] ( {
              title: `Nogmaals bedankt | WebDev Enquete`,
              pageTitle: 'Nogmaals bedankt',
              progress: 6,
              uuid: data.uuid,
              fromBegin: true
          } ) );
      } else {
          renderBody ( templates[ `${ data.state }Fn` ] ( {
              title: `${ title } | WebDev Enquete`,
              pageTitle: title,
              progress: data.state.substring ( 1 ),
              uuid: data.uuid
          } ) );
      }
  }

  /**
   *
   * @param uuid
   * @returns {Promise<unknown>}
   */
  function getAllUserData ( uuid ) {
      return new Promise ( ( resolve, reject ) => {
          fetch ( '/all', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify ( {
                  'uuid': uuid
              } )
          } )
              .then ( res => {
                  if ( res.ok ) {
                      resolve ( res.json () );
                  } else {
                      reject ( res );
                  }
              } );
      } )
  }

  /**
   *
   * @param promise
   * @returns {Promise<unknown>}
   */
  function throwLoadingState ( promise ) {
      return new Promise ( ( resolve, reject ) => {
          const body = document.querySelector ( 'body' );
          const header = body.querySelector ( 'header' );
          const main = body.querySelector ( 'main' );
          const footer = body.querySelector ( 'footer' );
          toggleBlurClass ( header, main, footer );
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin:auto;background:transparent;display:block;" width="201px" height="201px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
<g transform="translate(0 -6)">
  <circle cx="50" cy="42.8" r="5.84999" fill="#ffa57a" transform="rotate(271.8 50 50)">
    <animateTransform attributeName="transform" type="rotate" dur="1.6949152542372878s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50;360 50 50"></animateTransform>
    <animate attributeName="r" dur="1.6949152542372878s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" values="0;12;0" keySplines="0.2 0 0.8 1;0.2 0 0.8 1"></animate>
  </circle>
  <circle cx="50" cy="42.8" r="6.15001" fill="#005a85" transform="rotate(451.8 50 50)">
    <animateTransform attributeName="transform" type="rotate" dur="1.6949152542372878s" repeatCount="indefinite" keyTimes="0;1" values="180 50 50;540 50 50"></animateTransform>
    <animate attributeName="r" dur="1.6949152542372878s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" values="12;0;12" keySplines="0.2 0 0.8 1;0.2 0 0.8 1"></animate>
  </circle>
</g>
</svg>`;
          const loadingModal = createNodeFromString ( `<div class="modal"><div class="loading">${ svg }</div></div>` );
          body.append ( loadingModal );
          promise ()
              .then ( ( data ) => {
                  toggleBlurClass ( header, main, footer );
                  removeElement ( loadingModal );
                  resolve ( data );
              } )
              .catch ( ( err ) => {
                  toggleBlurClass ( header, main, footer );
                  removeElement ( loadingModal );
                  reject ( err );
              } );
      } )
  }

  /**
   *
   * @param markup
   */
  function createNodeFromString ( markup ) {
      const template = document.createElement ( 'template' );
      template.insertAdjacentHTML ( 'afterbegin', markup.trim () );
      return template.firstElementChild;
  }

  function renderBody ( markup ) {
      const app = document.querySelector ( '.app' );
      clearElement ( app );
      app.insertAdjacentHTML ( 'afterbegin', markup.trim () );
  }

  function removeElement ( el ) {
      el.parentElement.removeChild ( el );
  }

  function clearElement ( el ) {
      while ( el.firstChild ) {
          el.removeChild ( el.lastChild );
      }
  }

  function toggleBlurClass ( ...els ) {
      els.forEach ( el => {
          el.classList.toggle ( 'blur' );
      } );
  }

  function activatePrevNext () {
      document.querySelector ( 'form' ).addEventListener ( 'submit', ( e ) => {
          e.preventDefault ();
          if ( document.activeElement.value === 'Volgende vraag' ) {
              console.log ( "Volgende vraag" );
              getStorage().then(user => {
                  console.log(nextQ(user.state));
                  user.state = nextQ(user.state);
                  storeData(user);
                  sendData(user);
                  renderPage(user);
                  init(false);
              });
          } else {
              console.log ( "Vorige vraag" );
              getStorage().then(user => {
                  console.log(prevQ(user.state));
                  user.state = prevQ(user.state);
                  storeData(user);
                  sendData(user);
                  renderPage(user);
                  init(false);
              });
          }
      }, false );
  }

  function watchForm () {
      const form = document.querySelector ( 'form' );
      const state = form.elements.q.value;
      form.addEventListener ( 'change', ( e ) => {
          updateEntry ( form, state );
      } );
      document.getElementById ( 'desc' ).addEventListener ( 'keyup', ( e ) => {
          updateEntry ( form, state );
      } );
  }

  function storeData ( data ) {
      // check if localStorage is available.
      if ( typeof Storage !== 'undefined' ) {
          localStorage.setItem ( 'user', JSON.stringify ( data ) );
          return true;
      }
      return false;
  }

  function updateEntry ( form, state ) {
      if ( checkStorage () ) {
          getStorage ().then ( user => {
              if ( form.elements.grade ) {
                  user[ state ] = {
                      grade: form.elements.grade.value,
                      desc: form.elements.desc.value
                  };
              } else {
                  user[ state ] = {
                      desc: form.elements.desc.value
                  };
              }
              storeData ( user );
          } );
      }
  }

  function checkStorage () {
      if ( typeof Storage !== 'undefined' ) {
          // check if we have saved data in localStorage.
          const item = localStorage.getItem ( 'user' );
          const entry = item && JSON.parse ( item );

          if ( entry ) {
              // we have valid form data, try to submit it.
              return entry
          }
      } else {
          return false
      }
  }

  function getStorage () {
      return new Promise ( ( resolve, reject ) => {
          if ( typeof Storage !== 'undefined' ) {
              // check if we have saved data in localStorage.
              const item = localStorage.getItem ( 'user' );
              const entry = JSON.parse ( item );

              if ( entry ) {
                  // we have valid form data, try to submit it.
                  resolve ( entry );
              } else {
                  reject ( 'Entry not found' );
              }
          } else {
              reject ( "No local Storage available" );
          }
      } )
  }

  function sendData ( data ) {
      if (data._id) {
          delete data._id;
      }
      // send ajax request to server
      fetch ( '/update-user', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify ( data )
      } )
          .then ( ( res ) => {
              if ( res.ok ) {
                  console.log ( 'Data saved online' );
              }
          } )
          .catch ( ( error ) => {
              console.warn ( error );
          } );
  }

  function handleNetStates () {
      if ( navigator.onLine ) {
          netStatus ( 'online' );
      } else {
          netStatus ( 'offline' );
      }
      window.addEventListener ( 'online', () => {
          console.log ( 'online' );
          netStatus ( 'online' );
          getStorage ().then ( user => {
              sendData ( user );
          } );
      } );
      window.addEventListener ( 'offline', () => {
          netStatus ( 'offline' );
      } );
  }

  function netStatus ( status ) {
      console.log ( status );
      if ( document.getElementById ( 'onlineStatus' ) ) {
          document.getElementById ( 'onlineStatus' ).setAttribute ( 'class', status );
      } else {
          const notice = createNodeFromString ( `<section id="onlineStatus" class="${ status }"><p>💾 You seem to be offline</p> <span>Your data is saved locally and will be saved online when your connection comes back</span></section>` );
          document.querySelector ( 'header' ).insertAdjacentElement ( 'beforeend', notice );
      }
  }

  function nextQ ( q ) {
      return q[ 0 ] + ( parseInt ( q[ 1 ] ) + 1 );
  }

  function prevQ ( q ) {
      return q[ 0 ] + ( parseInt ( q[ 1 ] ) - 1 );
  }

}());
