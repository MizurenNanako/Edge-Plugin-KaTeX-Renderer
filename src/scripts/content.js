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
        inithooks();
    });
}

// Only activate listeners if KaTeX has been loaded
if (katexLoaded) {
    inithooks();
}

function inithooks() {
    // Call the renderOnScreen function when the page is first loaded
    // renderOnScreen();

    // Listen for scroll events and call the renderOnScreen function as the user scrolls down the page
    // window.addEventListener('scroll', function () {
    //     renderOnScreen();
    // });

    // Listen for changes to the DOM and re-render equations if necessary
    // var observer = new MutationObserver(function () {
    //     renderOnScreen();
    // });
    // observer.observe(document.body, { childList: true, subtree: true });

    // const selectorStr = 'p:not([katex-loaded]), div:not([katex-loaded]) > span:not([katex-loaded])';
    const selectorStr = 'p, div > span, div:not(:has(div)):not(:has(span)):not(:has(p))';

    function InstantRender() {
        var selection = window.getSelection();
        if (selection.isCollapsed) {
            var elements = document.querySelectorAll(selectorStr);
            renderMathEquations(elements, function (elem) {
                if (!isElementInViewport(elem)) return false;
                var divclass = elem.attributes['class'];
                if (!divclass || divclass.value.search(/editor/g) == -1) return true;
                return false;
            });
            console.log('Instant Render');
        }
        else {
            renderMathEquation(selection.anchorNode.parentElement);
            console.log('Instant Render in Selection');
        }
    }

    function FullPageRender() {
        var elements = document.querySelectorAll(selectorStr);
        renderMathEquations(elements, function (elem) {
            var divclass = elem.attributes['class'];
            if (!divclass || divclass.value.search(/editor/g) == -1) return true;
            return false;
        });
    }

    function InstantDeRender() {
        var elements = document.querySelectorAll('span.katex > span.katex-mathml > math > semantics > annotation')
        for (const element of elements) {
            var theSpan = element.parentNode.parentNode.parentNode.parentNode;
            var theDis = theSpan.parentNode;
            if (theSpan && theSpan.className === 'katex') {
                if (!isElementInViewport(theSpan))
                    continue;
                if (theDis && ['katex-display', 'math math-inline'].includes(theDis.className))
                    theDis.outerHTML = '<br/>$$' + element.textContent + '$$<br/>';
                // else if (theDis.className.search('math') != -1)
                //     theDis.parentNode.innerHTML = '$' + element.textContent + '$';
                else
                    theSpan.outerHTML = '$' + element.textContent + '$';
            }
        }
        console.log('Instand De-Render');
    }

    function FullPageDeRender() {
        var elements = document.querySelectorAll('span.katex > span.katex-mathml > math > semantics > annotation')
        for (const element of elements) {
            var theSpan = element.parentNode.parentNode.parentNode.parentNode;
            var theDis = theSpan.parentNode;
            if (theSpan && theSpan.className === 'katex') {
                if (theDis && theDis.className === 'katex-display')
                    theDis.outerHTML = '<br/>$$' + element.textContent + '$$<br/>';
                // else if (theDis.className.search('math') != -1)
                //     theDis.parentNode.innerHTML = '$' + element.textContent + '$';
                else
                    theSpan.outerHTML = '$' + element.textContent + '$';
            }
        }
        console.log('Full Page De-Render');
    }

    function ForceRender() {
        var selection = window.getSelection();
        if (selection.isCollapsed) {
            console.log('Force Render: No Selection!');
            return;
        }
        // Get the range that corresponds to the selection
        const range = selection.getRangeAt(0);
        // Extract the selected content from the DOM tree
        const selectedContent = range.extractContents();
        // Create a new element to replace the selected content
        const newElement = document.createElement('span');
        // Append the selected content to the new element
        newElement.appendChild(selectedContent);
        // Modify the contents of the new element as needed
        try {
            newElement.innerHTML = katex.renderToString(newElement.innerHTML);
        } catch (err) {
            console.error('Error rendering equation: ', err);
            newElement.innerHTML = newElement.innerHTML;
        }
        // Insert the new element into the DOM tree
        range.insertNode(newElement);
        // Reinsert the remaining text before and after the selection
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;
        if (startContainer !== endContainer) {
            let currentNode = startContainer.nextSibling;
            while (currentNode && currentNode !== endContainer) {
                const nextNode = currentNode.nextSibling;
                newElement.parentNode.insertBefore(currentNode, newElement.nextSibling);
                currentNode = nextNode;
            }
            newElement.parentNode.insertBefore(endContainer, newElement.nextSibling);
        } else {
            const secondHalf = startContainer.splitText(range.endOffset);
            newElement.parentNode.insertBefore(secondHalf, newElement.nextSibling);
        }
        console.log('Force Render');
    }

    function SyntaxCheck() {
        var selection = window.getSelection();
        if (selection.isCollapsed) {
            console.log('Syntax Checker: No Selection!');
            return;
        }
        // Do syntax check
        const newElement = document.createElement('span');
        // Append the selected content to the new element
        newElement.appendChild(selection.getRangeAt(0).cloneContents());
        const elems = newElement.innerHTML.trim().matchAll(/\$\$(.*?)\$\$|\$(.*?)\$/gm);
        // Expected: Array ["match1", "grp1$$", "grp2$", "1"]
        var success = true;
        for (const elem of elems) {
            const el = elem[1] ? elem[1] : elem[2];
            try {
                console.log(el);
                katex.renderToString(el);
            } catch (err) {
                // console.error('Error rendering equation: ', err);
                success = false;
                alert("Syntax Check Failed: " + err);
            }
        }
        if (success) {
            alert("All Syntax Check Passed.");
        }
    }

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        switch (message.action) {
            case "KIR":
                InstantRender();
                break;
            case "KFPR":
                FullPageRender();
                break;
            case "KIDR":
                InstantDeRender();
                break;
            case "KFPDR":
                FullPageDeRender();
                break;
            case "KFR":
                ForceRender();
                break;
            case "KSC":
                SyntaxCheck();
                break;
            default:
                break;
        }
    });
}

// Define a function to render mathematical equations using KaTeX
function renderMathEquations(elements, criteria) {
    for (const element of elements) {
        if (criteria(element)) {
            // console.log(element);
            renderMathEquation(element);
        }
    }
}

function renderMathEquation(element) {
    var content = element.textContent;

    function errRet(err, p1) {
        // console.error('Error rendering equation: ', err);
        // span.katex > span.katex-mathml > math > semantics > annotation
        return '<span class="katex"><span style="color:red">'
            + err
            + '</span><span class="katex-mathml"><math><semantics><annotation>'
            + p1
            + '</annotation></semantics></math></span></span>';
    }

    if (content.includes('$')) {

        var regex = /\$\$(.*?)\$\$/g;
        var newText = content.replace(regex, function (_match, p1) {
            try {
                return katex.renderToString(p1.trim(), { displayMode: true });
            } catch (err) {
                return errRet(err, p1);
            }
        });

        regex = /\$(.*?)\$/g;
        newText = newText.replace(regex, function (_match, p1) {
            try {
                return katex.renderToString(p1.trim());
            } catch (err) {
                return errRet(err, p1);
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
