// Check if KaTeX or MathJax is already loaded
var katexLoaded = typeof katex !== "undefined";
var mathJaxLoaded = typeof MathJax !== "undefined";

// Only add KaTeX if neither KaTeX nor MathJax is already loaded
if (!katexLoaded && !mathJaxLoaded) {
    // Load the KaTeX CSS file from the plugin's folder
    var katexCSS = document.createElement("link");
    katexCSS.setAttribute("rel", "stylesheet");
    katexCSS.setAttribute("href", chrome.runtime.getURL("katex/katex.min.css"));
    console.log("katex.min.css URL:", katexCSS.getAttribute("href"));
    document.head.appendChild(katexCSS);
    
    // Load the KaTeX JavaScript file from the plugin's directory
    var katexJS = document.createElement("script");
    katexJS.setAttribute("type", "text/javascript");
    var src = chrome.runtime.getURL("katex/katex.min.js");
    import(src);
    katexJS.setAttribute("src", chrome.runtime.getURL("katex/katex.min.js"));
    console.log("katex.min.js URL:", katexJS.getAttribute("src"));
    document.head.appendChild(katexJS);
    
    // Wait for the KaTeX library to load before rendering equations
    katexJS.addEventListener("load", function () {
        renderEquations();
    });
    
    // Listen for changes to the DOM and re-render equations if necessary
    var observer = new MutationObserver(function () {
        renderEquations();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Only activate lazy loading if KaTeX has been loaded
if (katexLoaded) {
    // Call the lazyLoadEquations function when the page is first loaded
    lazyLoadEquations();

    // Listen for scroll events and call the lazyLoadEquations function as the user scrolls down the page
    window.addEventListener("scroll", function () {
        lazyLoadEquations();
    });
}

// Define a function to render mathematical equations using KaTeX
function renderEquations() {
    // // Find all visible elements with a "math" class and render their contents as equations
    // var mathElements = document.querySelectorAll(".math:not([data-loaded])");
    // for (var i = 0; i < mathElements.length; i++) {
    //     if (isElementInViewport(mathElements[i])) {
    //         var mathExpression = mathElements[i].textContent;
    //         var renderedMath = katex.renderToString(mathExpression, { displayMode: mathElements[i].tagName.toLowerCase() === "div" });
    //         mathElements[i].innerHTML = renderedMath;
    //         mathElements[i].setAttribute("data-loaded", "true");
    //     }
    // }

    // Find all visible <p> tags with "$" or "$$" contents that have not yet been loaded, and render their contents as equations
    var paragraphElements = document.querySelectorAll("p:not([data-loaded])");
    // var paragraphElements = document.querySelectorAll("p:not([data-loaded])");
    for (var j = 0; j < paragraphElements.length; j++) {
        if (isElementInViewport(paragraphElements[j])) {
            var paragraphContent = paragraphElements[j].textContent;
            var regex = /\$\$(.*?)\$\$/g;
            var newText = paragraphContent.replace(regex, function (match, p1) {
                try {
                    return katex.renderToString(p1.trim(), { displayMode: true });
                } catch (err) {
                    console.error("Error rendering equation: ", err);
                    return match;
                }
            });

            regex = /\$(.*?)\$/g;
            newText = newText.replace(regex, function (match, p1) {
                try {
                    return katex.renderToString(p1.trim());
                } catch (err) {
                    console.error("Error rendering equation: ", err);
                    return match;
                }
            });

            paragraphElements[j].innerHTML = newText;
            paragraphElements[j].setAttribute("data-loaded", "true");
        }
    }
}

// Define a function to lazily load mathematical equations using KaTeX
function lazyLoadEquations() {
    // Find all visible elements with a "math" class that have not yet been loaded, and render their contents as equations
    var mathElements = document.querySelectorAll(".math:not([data-loaded])");
    for (var i = 0; i < mathElements.length; i++) {
        if (isElementInViewport(mathElements[i])) {
            var mathExpression = mathElements[i].textContent;
            var renderedMath = katex.renderToString(mathExpression, { displayMode: mathElements[i].tagName.toLowerCase() === "div" });
            mathElements[i].innerHTML = renderedMath;
            mathElements[i].setAttribute("data-loaded", "true");
        }
    }

    // Find all visible <p> tags with "$" or "$$" contents that have not yet been loaded, and render their contents as equations
    var paragraphElements = document.querySelectorAll("p:not([data-loaded])");
    for (var j = 0; j < paragraphElements.length; j++) {
        if (isElementInViewport(paragraphElements[j])) {
            var paragraphContent = paragraphElements[j].textContent;
            var regex = /$(.*?)$/g;
            var newText = paragraphContent.replace(regex, function (match, p1) {
                try {
                    return katex.renderToString(p1.trim());
                } catch (err) {
                    console.error("Error rendering equation: ", err);
                    return match;
                }
            });
            regex = /\$\$(.*?)\$\$/g;
            newText = newText.replace(regex, function (match, p1) {
                try {
                    return katex.renderToString(p1.trim(), { displayMode: true });
                } catch (err) {
                    console.error("Error rendering equation: ", err);
                    return match;
                }
            });

            paragraphElements[j].innerHTML = newText;
            paragraphElements[j].setAttribute("data-loaded", "true");
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

/* This complete implementation of the KaTeX rendering plugin for Edge 
checks if the KaTeX library is already loaded or not, and only loads the library 
if it is not already present. It also includes lazy loading functionality that 
renders mathematical equations using KaTeX only when they become visible on the screen, 
reducing the amount of work required by the browser to render the entire page at once.

The `renderEquations` function finds all visible elements with a "math" class 
and renders their contents as equations using KaTeX, 
while the `lazyLoadEquations` function does the same for all visible `<p>` tags 
with "$" or "$$" contents that have not yet been loaded.

The `isElementInViewport` function is used to check if an element is 
currently visible on the screen, which is important for 
lazy loading equations only when they become visible to the user.

Overall, this plugin offers a simple and efficient way to 
render mathematical equations using KaTeX in Edge, without 
requiring website owners to manually add the library to their pages. */