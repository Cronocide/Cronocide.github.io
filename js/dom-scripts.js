/* Expandable sections */
(function () {
  function toggle (button, target) {
    var expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !expanded);
    target.hidden = !target.hidden;
  }

  var expanders = document.querySelectorAll('[data-expands]');

  Array.prototype.forEach.call(expanders, function (expander) {
    var target = document.getElementById(expander.getAttribute('data-expands'));

    expander.addEventListener('click', function () {
      toggle(expander, target);
    })
  })
}());

/* Menu button */
(function () {
  var button = document.getElementById('menu-button');
  if (button) {
    var menu = document.getElementById('patterns-list');
    button.addEventListener('click', function() {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
    })
  }
}());

function checkForStatusText() {
  // Reach out to https://crono.link/status.json and see if any text is returned. If so, display it.
  const lastUpdate = localStorage.getItem('bannerClosed');
  if (((new Date().getTime() / 1000) - lastUpdate) > 500) {
    fetch('https://gist.cronocide.net/Cronocide/site-status/raw/HEAD/status.json', { redirect: 'follow'}).then(response => {
      if (!response.ok) {
        throw new Error(`Unable to get site status: got ${response.status}`);
      }
      return response.json();
    })
    .then(text => {
      if (!(Object.keys(text).length === 0)) {
        // Display the fetched text in an element
        document.getElementById('banner-text').textContent = text.message;
        document.getElementById('banner').classList.add('fade-in');
        if (Object.hasOwn(text, 'type')) {
          document.getElementById('banner').classList.add(text.type);
        }
        document.getElementById('banner').style.display = null;
      }
    })
    .catch(error => {
      // Handle errors
      console.error('Error fetching site-status text:', error);
    });
  }
}

function fadeBanner() {
  var banner = document.querySelectorAll('#banner.fade-in')
  if (banner.length > 0) {
    banner[0].classList.remove('fade-in');
  } else {
    document.getElementById('banner').classList.add('fade-out');
    localStorage.setItem('bannerClosed', (new Date().getTime() / 1000));
  }
}
try {
  document.getElementById('banner').addEventListener('animationend', fadeBanner);
  document.addEventListener('DOMContentLoaded', checkForStatusText);
} catch(e) {

}

/* Persist navigation scroll point */
(function () {
  window.onbeforeunload = function () {
    var patternsNav = document.getElementById('patterns-nav');
    if (patternsNav) {
      var scrollPoint = patternsNav.scrollTop;
      localStorage.setItem('scrollPoint', scrollPoint);
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('patterns-nav')) {
      if (window.location.href.indexOf('patterns/') !== -1) {
        document.getElementById('patterns-nav').scrollTop = parseInt(localStorage.getItem('scrollPoint'));
      } else {
        document.getElementById('patterns-nav').scrollTop = 0;
      }
    }
  })
}());

/* Rip out prism inline styles */
function removePrismInlines() {
  for (var element of document.querySelectorAll('pre.language-bash')) {
    element.style = null;
  }
  for (var element of document.querySelectorAll('pre.language-sh')) {
    element.style = null;
  }
}
document.addEventListener('DOMContentLoaded', removePrismInlines);


/* Enable scrolling by keyboard of code samples */
(function () {
  var codeBlocks = document.querySelectorAll('pre, .code-annotated');

  Array.prototype.forEach.call(codeBlocks, function (block) {
    if (block.querySelector('code')) {
      block.setAttribute('role', 'region');
      block.setAttribute('aria-label', 'code sample');
      if (block.scrollWidth > block.clientWidth) {
        block.setAttribute('tabindex', '0');
      }
    }
  });
}());

/* Auto-animate HRs */
// listen for scroll event and call animate function
document.addEventListener('DOMContentLoaded', animate);
document.addEventListener('scroll', animate);

// check if element is in view
function inView(element) {
  // get window height
  var elementHeight = element.clientHeight;
  var windowHeight = window.innerHeight;
  // get number of pixels that the document is scrolled
  var scrollY = window.scrollY;
  // get current scroll position (distance from the top of the page to the bottom of the current viewport)
  var scrollPosition = scrollY + windowHeight;
  // get element position (distance from the top of the page to the bottom of the element)
  var elementPosition = element.getBoundingClientRect().top + scrollY + elementHeight;
  // is scroll position greater than element position? (is element in view?)
  if (scrollPosition > elementPosition) {
    return true;
  }
  return false;
}

// animate element when it is in view
function animate() {
  // is element in view?
  for (var element of document.querySelectorAll('hr')) {
    if (inView(element)) {
        // element is in view, add class to element
        element.classList.add('animate');
    }
  }
  if (inView(document.querySelector('.intro-and-nav'))) {
      // element is in view, add class to element
      element.classList.add('animate');
  }
}
