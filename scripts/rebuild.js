var fs      = require('fs'),
    path    = require('path'),
    xml2js  = require('xml2js'),
    events  = require('events'),
    crypto = require('crypto');

var xmlEscape = function (str) {
  var entities = {
    '<' : '&lt;',
    '>' : '&gt;',
    '"' : '&quot;',
    '\'' : '&apos;'
  };
  var s = '';
  for (var i = 0; i < str.length; i ++) {
    var c = str.charCodeAt(i);
    if (c < 32 || c > 126) {
      s += '&#x' + c.toString(16) + ';';
    } else {
      c = str.charAt(i);
      if (entities[c]) {
        c = entities[c];
      }
      s += c;
    }
  }
  return s;
}

var attrToString  = function (attr, value) {
  return attr + '="' + xmlEscape(value + "") + '"';
};

var glyphToString = function (glyph) {
  var s = [];
  var attrs = ['id', 'glyph-name', 'unicode', 'd', 'horiz-adv-x'];
  for (var i in attrs) {
    var attr = attrs[i];
    if (glyph.$[attr] !== undefined) {
      s.push(attrToString(attr, glyph.$[attr]));
    }
  }
  return '<glyph\n  ' + s.join('\n  ') + '/>\n';
};

var args = process.argv.splice(2);
var font = require(args[0]);
var dirname = path.dirname(args[0]) + '/';

var widthMap = font.widthMap;

var reverseFontMap = {};
for (k in font.map) {
  reverseFontMap[font.map[k]] = '&#x' + k + ';';
}
var files = font.files;

var all_glyphs = "\n";
for(var i in files) {

  var file = files[i];
  var data = fs.readFileSync(dirname + file);

  (new xml2js.Parser()).parseString(data, function (err, result) {
    var glyphs = result.svg.defs[0].font[0].glyph;
    
    for (var i = 0; i < glyphs.length; i ++) {
      glyphs[i].$.unicode = reverseFontMap[glyphs[i].$.unicode] || glyphs[i].$.unicode;
      if (widthMap[glyphs[i].$['glyph-name']] !== undefined) {
        glyphs[i].$['horiz-adv-x']= widthMap[glyphs[i].$['glyph-name']];
      }
      all_glyphs += glyphToString(glyphs[i]);
    }
  });

}

var template = fs.readFileSync('../src/base.svg', 'utf8');
fs.writeFileSync(font.outfile, template.replace('{{glyphs}}', all_glyphs));