/* global Fluid */

HTMLElement.prototype.wrap = function(wrapper) {
  this.parentNode.insertBefore(wrapper, this);
  this.parentNode.removeChild(this);
  wrapper.appendChild(this);
};

Fluid.events = {

  registerNavbarEvent: function() {
    var navbar = $('#navbar');
    var submenu = $('#navbar .dropdown-menu');
    if (navbar.offset().top > 0) {
      navbar.removeClass('navbar-dark');
      submenu.removeClass('navbar-dark');
    }
    Fluid.utils.listenScroll(function() {
      navbar[navbar.offset().top > 50 ? 'addClass' : 'removeClass']('top-nav-collapse');
      submenu[navbar.offset().top > 50 ? 'addClass' : 'removeClass']('dropdown-collapse');
      if (navbar.offset().top > 0) {
        navbar.removeClass('navbar-dark');
        submenu.removeClass('navbar-dark');
      } else {
        navbar.addClass('navbar-dark');
        submenu.removeClass('navbar-dark');
      }
    });
    $('#navbar-toggler-btn').on('click', function() {
      $('.animated-icon').toggleClass('open');
      $('#navbar').toggleClass('navbar-col-show');
    });
  },

  registerParallaxEvent: function() {
    var bg = $('#banner[parallax="true"]');
    if (bg.length === 0) {
      return;
    }
    var board = $('#board');
    if (board.length === 0) {
      return;
    }
    var parallax = function() {
      var oVal = $(window).scrollTop() / 5;
      var offset = parseInt(board.css('margin-top'), 0);
      var max = 96 + offset;
      if (oVal > max) {
        oVal = max;
      }
      bg.css({
        transform          : 'translate3d(0,' + oVal + 'px,0)',
        '-webkit-transform': 'translate3d(0,' + oVal + 'px,0)',
        '-ms-transform'    : 'translate3d(0,' + oVal + 'px,0)',
        '-o-transform'     : 'translate3d(0,' + oVal + 'px,0)'
      });
      var toc = $('#toc');
      if (toc) {
        $('#toc-ctn').css({
          'padding-top': oVal + 'px'
        });
      }
    };
    Fluid.utils.listenScroll(parallax);
  },

  registerScrollDownArrowEvent: function() {
    var scrollbar = $('.scroll-down-bar');
    if (scrollbar.length === 0) {
      return;
    }
    scrollbar.on('click', function() {
      Fluid.utils.scrollToElement('#board', -$('#navbar').height());
    });
  },

  registerScrollTopArrowEvent: function() {
    var topArrow = jQuery('#scroll-top-button');
    if (topArrow.length === 0) {
      return;
    }
    var board = jQuery('#board');
    if (board.length === 0) {
      return;
    }
    var arrowUpIcon = jQuery('#scroll-top-button i');
    if(arrowUpIcon.length === 0){
      return;
    } 
    var posDisplay = false;
    var scrollDisplay = false;
    // Position
    var setTopArrowPos = function() {
      var boardRight = board[0].getClientRects()[0].right;
      var bodyWidth = document.body.offsetWidth;
      var right = bodyWidth - boardRight;
      posDisplay = right >= 50;
      topArrow.css({
        'bottom': scrollDisplay ? '20px' : '-60px',
        'right' : posDisplay ? right - 64 : 8 + 'px',
        'min-width' : posDisplay ? 40 : 28 + 'px',
        'min-height' : posDisplay ? 40 : 28 + 'px'
      });
      arrowUpIcon.css({
        'font-size' : posDisplay ? 32 : 20 + 'px'
      });
    };
    setTopArrowPos();
    jQuery(window).resize(setTopArrowPos);
    // Display
    var headerHeight = board.offset().top;
    Fluid.utils.listenScroll(function() {
      var scrollHeight = document.body.scrollTop + document.documentElement.scrollTop;
      scrollDisplay = scrollHeight >= headerHeight;
      topArrow.css({
        'bottom': scrollDisplay ? '20px' : '-60px'
      });
    });
    // Click
    topArrow.on('click', function() {
      jQuery('body,html').animate({
        scrollTop: 0,
        easing   : 'swing'
      });
    });
  },

  billboard: function() {
    if (!('console' in window)) {
      return;
    }
    // eslint-disable-next-line no-console
    console.log(`
------------------------------------------------
|                                              |
|     ________  __            _        __      |
|    |_   __  |[  |          (_)      |  ]     |
|      | |_ \\_| | | __   _   __   .--.| |      |
|      |  _|    | |[  | | | [  |/ /'\`\\' |      |
|     _| |_     | | | \\_/ |, | || \\__/  |      |
|    |_____|   [___]'.__.'_/[___]'.__.;__]     |
|                                              |
|           Powered by Hexo x Fluid            |
|         GitHub: https://git.io/JqpVD         |
|                                              |
------------------------------------------------
    `);
  }
};
