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
    var src = chrome.runtime.getURL("katex/katex.min.js");
    import(src);    // I don't know why exactly but this is needed.
    var katexJS = document.createElement('script');
    katexJS.setAttribute('type', 'text/javascript');
    katexJS.setAttribute('src', src);
    console.log('katex.min.js URL:', katexJS.getAttribute('src'));
    document.head.appendChild(katexJS);

    // Wait for the KaTeX library to load before rendering equations
    katexJS.addEventListener('load', function () {
        // renderMathEquations();
        inithooks();
    });
}

// Only activate lazy loading if KaTeX has been loaded
if (katexLoaded) {
    inithooks();

}

function inithooks() {
    // Call the renderMathEquations function when the page is first loaded
    // renderMathEquations();

    // Listen for scroll events and call the renderMathEquations function as the user scrolls down the page
    // window.addEventListener('scroll', function () {
    //     renderMathEquations();
    // });

    // Listen for changes to the DOM and re-render equations if necessary
    // var observer = new MutationObserver(function () {
    //     renderMathEquations();
    // });
    // observer.observe(document.body, { childList: true, subtree: true });

    function KIR() {
        var selection = window.getSelection();
        if (selection.isCollapsed) {
            renderMathEquations();
            console.log('KIR');
        }
        else {
            renderMathEquation(selection.anchorNode.parentElement);
            console.log('KIRDOM');
        }
    }

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.action == "KIR") {
            KIR();
        }
    });
    // chrome.action.onClicked.addListener(function (tab) { KIR(); });
}

// Define a function to render mathematical equations using KaTeX
function renderMathEquations() {
    var elements = document.querySelectorAll('p:not([katex-loaded]), span:not([katex-loaded]), div:not(:has(div)):not([katex-loaded])');

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (isElementInViewport(element)) {
            var divclass = element.attributes['class'];
            if (divclass && divclass.value.search("edit") != -1) {
                continue;
            }
            renderMathEquation(element);
        }
    }
}

function renderMathEquation(element) {
    var content = element.textContent;

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
    // element.setAttribute('katex-loaded', 'true');
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
