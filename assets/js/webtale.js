/*
	Page elements
 */


/*
	States and animating variables
*/

var Universe = {
	systems : null,
	x : 0,
	y : 0,
	touchxstart: 0,
	touchxcurrent: 0,
	touchxend: 0,
	touchystart: 0,
	touchycurrent: 0,
	touchyend: 0,
	canScroll : false,

	$self : null,
	$systems : null,
	$currentsystem : null,

	init : function() {
		this.$self = $('#universe');
		this.$systems = $('#universe > .systems')
		this.$currentsystem = $('#loading')

		World.init();
		this.reset();
	},

	reset: function() {
		this.x = 0;
		this.y = 0;

		this.touchxstart = 0;
		this.touchxcurrent = 0;
		this.touchxend = 0;
		this.touchystart = 0;
		this.touchycurrent = 0;
		this.touchyend = 0;

		this.resize();

		resetSystems();
	},

	resize : function() {
		// resize all systems
		resizeSystems();

		// resize timeline (scrollbar)
		World.resizeTimeline();

		// move viewport immediately after resize if
		if (preload == 100) {
			this.moveViewport(0);
		}
	},

	_moveViewportTo: function(x, y, duration, callback) {
		this.$self.animate({
			'left' : x + 'px',
			'top' : y + 'px',
		}, duration, 'easeInOutQuint', function() {
			// done moving to target system
			Universe.x = x;
			Universe.y = y;

			if (callback) {
				callback();
			}
		});
	},

	moveViewport : function($system, duration, callback) {
		if ($system == undefined || typeof $system == 'function') {
			$system = Universe.$currentsystem;
		}

		this._moveViewportTo(-$system.position().left, -$system.position().top, duration, function() {
			// done moving to target system
			Universe.$currentsystem = $system;

			if (callback) {
				callback();
			}
		});
	},

	lockScroll: function() {
		Universe.canScroll = false;
		World.resizeTimeline();
	},

	unlockScroll: function() {
		Universe.canScroll = true;
		World.resizeTimeline();
	}
};

var World = {
	timelinePos: 0,
	timeLineLastPos: 0,
	timelineLastMove: 0,

	groundPos: 0,
	groundLastPos: 0,
	groundLastMove: 0,

	$self : null,
	$layers : null,
	$stage : null,
	$actor : null,
	$sectors : null,
	$currentlevel : null,
	currentsector : 0,

	init : function() {
		this.timelinePos = 0;
		this.timelineLastPos = 0;
		this.timelineLastMove = 0;

		this.$self = $('#site-world');
		this.$layers = $('#site-world .layer');
		this.$actor = $('#site-world .actor');
		this.$stage = $('#site-world .stage');
		this.$sectors = $('#site-world .stage .sector');
		this.$currentlevel = $('#site-world .stage .level').eq(0);
		this.currentsector = 0;

		this.initLayers();
	},

	initLayers: function() {
		this.$layers.each(function(index) {
			var $layer = $(this);
			var $level = $layer.find('.level'); // only one level for now, more to be added later

			// set layers speed for parallax, adjust world size
			var lspeed = ($layer.outerWidth() - World.$self.outerWidth()) / (World.$layers.last().outerWidth() - World.$self.outerWidth())
			$layer.data('lspeed', lspeed);

			// adjust width to fit all sectors
			if ($level.hasClass('horizontal')) {
				var length = 0;
				var $sectors = $level.find('.sector');

				$sectors.each(function(pos) {
					var $sector = $(this);
					length += $sector.outerWidth();
				});

				$level.width(length + 'px');
			}
			else if ($level.hasClass('vertical')) {
				var length = 0;
				var $sectors = $level.find('.sector');

				$sectors.each(function(pos) {
					var $sector = $(this);
					length += $sector.outerHeight();
				});

				$level.height(length + 'px');
			}

			// all levels must be at least as high as viewport
			var vsize = getViewportSize();
			$level.css({
				'min-height' : vsize.height + 'px',
				'height' : vsize.height + 'px'
			});
		});
	},

	resizeTimeline : function() {
		var length = 0;

		if (Universe.canScroll) {
			World.$sectors.each(function(index) {
				var $level = $(this);

				if ($level.hasClass('horizontal')) {
					length += $level.width();
				}
				else if ($level.hasClass('vertical')) {
					length += $level.height();
				}
				else {
					// implement more chapters types here...
				}
			});

			// FIXME dirty hack to make debug work
			length = 8888;
		}
		else {
			// reduce to zero to prevent scrolling
		}

		//alert('timeline size = '+ length)

		$('#timeline').css('height', length);
	},

	getTimelinePos: function() {
		World.timelineLastMove = Math.abs(World.timelinePos - World.timelineLastPos);
		World.timelineLastPos = World.timelinePos;

		if (deviceName == "computer") {
			// desktop
			World.timelinePos = $(window).scrollTop();
		}
		else {
			// mobile
			World.timelinePos = World.timelinePos + (Universe.touchxstart - Universe.touchxcurrent);

			if (World.timelinePos < 0) {
				World.timelinePos = 0;
			}
			if (World.timelinePos > World.$self.outerHeight()) {
				World.timelinePos = World.$self.outerHeigh();
			}
		}

		return World.timelinePos
	}

};

var Blog = {};

var Splash = {}

var End = {};

/*
 * Utilities
 */

function getViewportSize() {
	return {
		width : $(window).width(),
		height : $(window).height()
	};
}

function applySize(element, size) {
	$(element).css({
		'width' : size.width + 'px',
		'height' : size.height + 'px',
	});
}

function changeSubsystem(element, css) {
	// save original state of element to be able to restore it?
}

/*
 * Systems (slides) management
 */

function resetSystems() {
	// reset and resize all systems and content to fit screen
	$systems.each(function(index) {
		var $system = $(this);
		var size = getViewportSize();

		resetSystem($system);
		resizeSystem($system, size);
	});

	//
}

function resizeSystems() {
	$systems.each(function(index) {
		var $system = $(this);
		var size = getViewportSize();

		resizeSystem($system, size);
	})
}

function resetSystem($system) {
	// reposition every children to original position,
}

function resizeSystem($system, size) {
	// reposition system div
	$system.css({
		'left' : ($system.data('ux') * size.width) + 'px',
		'top' : ($system.data('uy') * size.height) + 'px',
	});

	// resize system div
	applySize($system, size)
}

/*
	Animating
*/

function sfx($element, classes) {
	if ($element.hasClass('idle')) $element.removeClass('idle').addClass('nidle');
	$element.addClass('animated '+ classes);
}

function unsfx($element) {
	if ($element.hasClass('nidle')) $element.removeClass('nidle').removeClass('animated').addClass('idle');
}


/*
	Preloading
*/

var preload = 0;
var preloadSI = -1;

function preloadEverything() {
	preloadElements();
	preloadSubscribe();
	preloadWorld();
	preloadPosts();

	preloadSI = setInterval(function(){
		preload += 4;
		if (preload >= 100) {
			preload = 100;
			clearInterval(preloadSI);

			Universe.moveViewport($('#site-subscribe'), 1000, function(){
				// done loading

				// animate scene
				sfx($('#site-subscribe > *'), 'bounceInLeft');
			});
		}
		$('#percent').text(preload)
	}, 100);
}

function preloadElements() {
	// cache all jQuery objects for quick access
	$loader = $('#loading');
	$universe = $('#universe'); // full-screen zones
	$systems = $('#universe > .system'); // full-screen zones
}

function preloadSubscribe() {
	// load graphics, completion-dictionnary
}

function preloadWorld() {
	// load graphics, musics, summaries
}

function preloadPosts() {
	// load posts?
}

/*

function enterSector($sector, actorPos) {
	// highligth the sector
	$sector.css({'background-color' : 'red'});

	// animate internal elements
	//sfx();

	//
}

function leaveSector($sector, actorPos) {
	// remove highlight
	$sector.css({'background-color' : 'transparent'});
}

	Document initializing
*/

$(document).ready(function() {
	// cache assets and save page elements refs
	preloadEverything()

	if (deviceName != "computer") {
		alert('mobile mode')
		//initTouchEvents();
	}

	// initialize everything on the page
	Universe.init();
	Universe.lockScroll();

	$(window).on('beforeunload', function() {
		// prevent reload scroll issue
		$(window).scrollTop(0);

	}).on('scroll', function() {
		// animate on scroll
		if (Universe.canScroll) {
			animateOnScroll();
		}

	}).on('resize', function() {
		// resize world, universe and scroll length

		resizeSystems();
		World.resizeTimeline();
		animateOnScroll();

	}).on('orientationchange', function(event) {
		// freeze world during orientation changes

		Universe.lockScroll();
		setTimeout(function() {
			$(window).trigger('resize');
		}, 500);

	});

	$('#btViewSite').click(function(){
		Universe.moveViewport($('#site-wait'), 1000, function(){
			// display hints how to use the world...

			// auto switch to world after small 4s delay
			setTimeout(function(){
				Universe.moveViewport($('#site-world'), 500, function(){
					//
				});
			},4000);
		})
	});
});

function initTouchEvents() {
	document.addEventListener("touchstart", function(e) {
		Universe.touchxstart = e.targetTouches[0].pageX;

	}, false);
	document.addEventListener("touchmove", function(e) {
		e.preventDefault();
		Universe.touchxcurrent = e.targetTouches[0].pageX;

		if (Universe.canScroll) {
			animateOnScroll();
		}

	}, false);
	document.addEventListener("touchend", function(e) {
		e.preventDefault();
		Universe.touchxend = e.changedTouches[0].pageX;

	}, false);
}

function animateOnScroll() {
	//
}
