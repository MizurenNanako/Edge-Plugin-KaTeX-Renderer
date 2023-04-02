// Check if KaTeX or MathJax is already loaded
var katexLoaded = typeof katex !== 'undefined';
var mathJaxLoaded = typeof MathJax !== 'undefined';

// Only add KaTeX if neither KaTeX nor MathJax is already loaded
if (!katexLoaded && !mathJaxLoaded) {
    // Load the KaTeX CSS file from the plugin's folder
    var katexCSS = document.createElement('link');
    katexCSS.setAttribute('rel', 'stylesheet');
    katexCSS.setAttribute('href', chrome.runtime.getURL('katex/katex.min.css'));
    console.log('katex.min.css URL:', katexCSS.getAttribute('href'));
    document.head.appendChild(katexCSS);

    // Load the KaTeX JavaScript file from the plugin's directory
    // var katexJS = document.createElement('script');
    // katexJS.setAttribute('type', 'text/javascript');
    var src = chrome.runtime.getURL("katex/katex.min.js");
    import(src);
    // katexJS.setAttribute('src', src);
    // console.log('katex.min.js URL:', katexJS.getAttribute('src'));
    // document.head.appendChild(katexJS);

    // Wait for the KaTeX library to load before rendering equations
    // katexJS.addEventListener('load', function () {
        renderMathEquations();
    // });

    // Listen for changes to the DOM and re-render equations if necessary
    var observer = new MutationObserver(function () {
        renderMathEquations();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Only activate lazy loading if KaTeX has been loaded
if (katexLoaded) {
    // Call the renderMathEquations function when the page is first loaded
    renderMathEquations();

    // Listen for scroll events and call the renderMathEquations function as the user scrolls down the page
    window.addEventListener('scroll', function () {
        renderMathEquations();
    });
}

// Define a function to render mathematical equations using KaTeX
function renderMathEquations() {
    // Find all visible elements with a "math" class or most inner <div> tags with "$" or "$$" contents that have not yet been loaded, and render their contents as equations
    // var elements = document.querySelectorAll('.math:not([data-loaded]), div:not(:has(div)):not([katex-loaded])');
    var elements = document.querySelectorAll('.math, div:not(:has(div)):not([katex-loaded])');
    console.log(elements)

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (isElementInViewport(element)) {
            var content = element.textContent;
            var divclass = element.attributes['class'];
            if (divclass) {
                console.log(divclass);
                if (divclass.value.search(/editor/g) != -1)
                    continue;
            }

            if (content.includes('$')) {

                var regex = /\$\$(.*?)\$\$/g;
                var newText = content.replace(regex, function (match, p1) {
                    try {
                        return katex.renderToString(p1.trim(), { displayMode: true });
                    } catch (err) {
                        console.error('Error rendering equation: ', err);
                        return match;
                    }
                });

                regex = /\$(.*?)\$/g;
                newText = newText.replace(regex, function (match, p1) {
                    try {
                        return katex.renderToString(p1.trim());
                    } catch (err) {
                        console.error('Error rendering equation: ', err);
                        return match;
                    }
                });

                element.innerHTML = newText;

            }
            element.setAttribute('katex-loaded', 'true');
        }
    }
}

// Define a function to check if an element is currently visible on the screen
function isElementInViewport(element) {
    var rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
