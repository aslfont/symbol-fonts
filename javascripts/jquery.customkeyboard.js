(function($){
  
  var regEscape = function (s) {
    return s
      .split('\\').join( '\\\\')
      .split('.' ).join('\\.')
      .split('+' ).join('\\+')
      .split('*' ).join('\\*')
      .split('-' ).join('\\-')
      .split('[' ).join('\\[')
      .split(']' ).join('\\]')
      .split(')' ).join('\\)')
      .split('(' ).join('\\(');
    
  };
  

  var codeFor = function (x) {
    x = x.toUpperCase().charCodeAt(0);
    switch(x){
      case 96: return 192;
      case 45: return 189;
      case 61: return 187;
      case 91: return 219;
      case 93: return 221;
      case 92: return 220;
      case 59: return 186;
      case 39: return 222;
      case 44: return 188;
      case 46: return 190;
      case 47: return 191;
      default:
      return x;
    }
  };

  $.fn.customKeyboard = function(options) {
    var settings = $.extend({
      
    }, options);

    var textarea = this;
    var keyboard = $("<div>").addClass('customKeyboard')
      .append($("<a>").addClass("drag").attr("href","#").text("Keyboard"));
    keyboard.insertBefore(textarea);
    var $dragging = null;

    var heldx = 0;
    var heldy = 0;

    $(document).on("mousemove", function(e) {
        if ($dragging) {
            $dragging.offset({
                top: Math.max(0, Math.min($(document).height() - 100, e.pageY + heldy)),
                left: Math.max(0, Math.min($(window).width() - 100,e.pageX + heldx))
            });
        }
    });
    keyboard.find('.drag').click(function(e){ e.preventDefault(); });
    keyboard.find('.drag').on("mousedown", function (e) {
        e.preventDefault();
        heldx = $(e.target).offset().left - e.pageX;
        heldy = $(e.target).offset().top - e.pageY;
        $dragging = $(e.target).parent();
    });

    $(document).on("mouseup", function (e) {
        $dragging = null;
    });
    
    var replace = function (val) {
      $.each(settings.ligatures, function (k, v) {
        val = val.replace(new RegExp(regEscape(k) + '$', 'g'), typeof(v) == 'number' ? String.fromCharCode(v) : v);
      });
      return val;
    };
    var getReplacement = function (val, ligatures) {
      $.each(ligatures, function (k, v) {
        if(k != v)
          val = val.replace(new RegExp('.*' + regEscape(k) + '$', 'g'), typeof(v) == 'number' ? String.fromCharCode(v) : v);
      });
      return val;
    };
    
    var ligatures_by_key = {};
    $.each(settings.ligatures, function (k, v) {
      var last = k.charAt(k.length - 1);
      ligatures_by_key[last] = ligatures_by_key[last] || {};
      ligatures_by_key[last][k] = v;
    });
    
    var doReplace = false;
    var update = function () {
      var c = textarea.caret();
      var val = textarea.val();
      var val1 = val.substr(0, c);
      var val2 = replace(val1);
      if (doReplace && val1 != val2) {
        textarea.val(val2 + val.substr(c));
        textarea.caret(c);
      }
      
      keyboard.find('.preview').each(function(){
        var val3 = val2.substr(0, c) + $(this).attr('data-key');
        var val4 = getReplacement(val3, ligatures_by_key[$(this).attr('data-key')] || {});
        if (val3 == val4) {
          $(this).text($(this).attr('data-key'));
        } else {
          $(this).text(val4 + String.fromCharCode(160));
        }
        if (val3 != val4 || -1 != $.inArray($(this).attr('data-key'), settings.permahighlight)) {
          $(this).parent().addClass('compound');
        } else {
          $(this).parent().removeClass('compound');
        }
      });
    };

    var keylinks = {};
    var chars = '1234567890-=` qwertyuiop[]\\ asdfghjkl;\' zxcvbnm,./';
    var keys = chars.split(' ');
    for (var i=0;i<keys.length;i++) {
      var row = $('<div>').css('margin-left', (i)+'em');
      for (var j=0;j<keys[i].length; j++) {
        (function(i,j){
          var link = $('<a>').attr('href','#').addClass('key');
          link.append($('<span>').addClass('preview').text(keys[i][j]).attr('data-key', keys[i][j]));
          link.append($('<span>').addClass('name').text(keys[i][j]));
          link.click(function(e){
            e.preventDefault();
            textarea.val($('#texta').val() + keys[i][j])
            update();
          });
          keylinks['k' + codeFor(keys[i][j])] = link;
          row.append(link);
        }(i, j));
      }
      keyboard.append(row);
    }

    textarea.keydown(function(e){
      var el = keylinks['k' + e.which];
      if (el) {
        $('.key').removeClass('hover');
        el.addClass('hover');
      }
    });
    
    var t = null;
    textarea.keyup(function(e){
      doReplace = keylinks['k' + e.which] ? true : false;
      clearTimeout(t);
      t = setTimeout(update, 10);
    });
    update();
    
    return this;
  };
  
}(jQuery));



