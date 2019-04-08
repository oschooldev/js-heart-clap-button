import "document-register-element/build/document-register-element";

const VERSION = "3.3.0";
const API = "https://api.applause-button.com";

const getClaps = (api, url) =>
  // TODO: polyfill for IE (not edge)
  fetch(`${api}/get-claps` + (url ? `?url=${url}` : ""), {
    headers: {
      "Content-Type": "text/plain"
    }
  }).then(response => response.text());

const updateClaps = (api, claps, url) =>
  // TODO: polyfill for IE (not edge)
  fetch(`${api}/update-claps` + (url ? `?url=${url}` : ""), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: JSON.stringify(`${claps},${VERSION}`)
  }).then(response => response.text());

const arrayOfSize = size => new Array(size).fill(undefined);

const formatClaps = claps => claps.toLocaleString("en");

// toggle a CSS class to re-trigger animations
const toggleClass = (element, cls) => {
  element.classList.remove(cls);
  setTimeout(() => {
    element.classList.add(cls);
  }, 100);
  setTimeout(() => {
    element.classList.remove(cls);
  }, 1000);
};

const debounce = (fn, delay) => {
  var timer = null;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(context, args), delay);
  };
};

// https://github.com/WebReflection/document-register-element#v1-caveat
class HTMLCustomElement extends HTMLElement {
  constructor(_) {
    return (_ = super(_)).init(), _;
  }
  init() { }
}

const MAX_MULTI_CLAP = 10;

class ApplauseButton extends HTMLCustomElement {
  connectedCallback() {
    if (this._connected) {
      return;
    }

    this.classList.add("loading");
    this.style.display = "block";
    // when the color of the button is set via its color property, various
    // style properties are set on style-root, which are then inherited by the child elements
    this.innerHTML = `
    <div class="style-root">
    <div class="shockwave"></div>
    <div class="count-container">
      <div class="count"></div>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -28 512.00002 512">
      <g class="flat">
      <path d="m256 455.515625c-7.289062 0-14.316406-2.640625-19.792969-7.4375-20.683593-18.085937-40.625-35.082031-58.21875-50.074219l-.089843-.078125c-51.582032-43.957031-96.125-81.917969-127.117188-119.3125-34.644531-41.804687-50.78125-81.441406-50.78125-124.742187 0-42.070313 14.425781-80.882813 40.617188-109.292969 26.503906-28.746094 62.871093-44.578125 102.414062-44.578125 29.554688 0 56.621094 9.34375 80.445312 27.769531 12.023438 9.300781 22.921876 20.683594 32.523438 33.960938 9.605469-13.277344 20.5-24.660157 32.527344-33.960938 23.824218-18.425781 50.890625-27.769531 80.445312-27.769531 39.539063 0 75.910156 15.832031 102.414063 44.578125 26.191406 28.410156 40.613281 67.222656 40.613281 109.292969 0 43.300781-16.132812 82.9375-50.777344 124.738281-30.992187 37.398437-75.53125 75.355469-127.105468 119.308594-17.625 15.015625-37.597657 32.039062-58.328126 50.167969-5.472656 4.789062-12.503906 7.429687-19.789062 7.429687zm-112.96875-425.523437c-31.066406 0-59.605469 12.398437-80.367188 34.914062-21.070312 22.855469-32.675781 54.449219-32.675781 88.964844 0 36.417968 13.535157 68.988281 43.882813 105.605468 29.332031 35.394532 72.960937 72.574219 123.476562 115.625l.09375.078126c17.660156 15.050781 37.679688 32.113281 58.515625 50.332031 20.960938-18.253907 41.011719-35.34375 58.707031-50.417969 50.511719-43.050781 94.136719-80.222656 123.46875-115.617188 30.34375-36.617187 43.878907-69.1875 43.878907-105.605468 0-34.515625-11.605469-66.109375-32.675781-88.964844-20.757813-22.515625-49.300782-34.914062-80.363282-34.914062-22.757812 0-43.652344 7.234374-62.101562 21.5-16.441406 12.71875-27.894532 28.796874-34.609375 40.046874-3.453125 5.785157-9.53125 9.238282-16.261719 9.238282s-12.808594-3.453125-16.261719-9.238282c-6.710937-11.25-18.164062-27.328124-34.609375-40.046874-18.449218-14.265626-39.34375-21.5-62.097656-21.5zm0 0" data-original="#000000" class="active-path" data-old_color="#2ad2f7" fill="#2ad2f7"/>
      </g>
      <g class="outline">
         <path d="m471.382812 44.578125c-26.503906-28.746094-62.871093-44.578125-102.410156-44.578125-29.554687 0-56.621094 9.34375-80.449218 27.769531-12.023438 9.300781-22.917969 20.679688-32.523438 33.960938-9.601562-13.277344-20.5-24.660157-32.527344-33.960938-23.824218-18.425781-50.890625-27.769531-80.445312-27.769531-39.539063 0-75.910156 15.832031-102.414063 44.578125-26.1875 28.410156-40.613281 67.222656-40.613281 109.292969 0 43.300781 16.136719 82.9375 50.78125 124.742187 30.992188 37.394531 75.535156 75.355469 127.117188 119.3125 17.613281 15.011719 37.578124 32.027344 58.308593 50.152344 5.476563 4.796875 12.503907 7.4375 19.792969 7.4375 7.285156 0 14.316406-2.640625 19.785156-7.429687 20.730469-18.128907 40.707032-35.152344 58.328125-50.171876 51.574219-43.949218 96.117188-81.90625 127.109375-119.304687 34.644532-41.800781 50.777344-81.4375 50.777344-124.742187 0-42.066407-14.425781-80.878907-40.617188-109.289063zm0 0" data-original="#000000" class="active-path" data-old_color="#2ad2f7" fill="#2ad2f7"/>
      </g>
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 20 20">
      <g class="sparkle">
      ${arrayOfSize(5)
        .map(s => `<g><circle cx="0" cy="0" r="1"/></g>`)
        .join("")}
      </g>
    </svg>
  </div>
      `;

    this._styleRootElement = this.querySelector(".style-root");
    this._countElement = this.querySelector(".count");
    this._updateRootColor();
    // the number of claps that this user has made - this is limited
    // by the MAX_MULTI_CLAP property, and whether multiclap is enabled
    this._totalClaps = 0;

    let initialClapCountResolve;
    this._initialClapCount = new Promise(
      resolve => (initialClapCountResolve = resolve)
    );

    // buffer claps within a 2 second window
    this._bufferedClaps = 0;
    this._updateClaps = debounce(() => {
      if (this._totalClaps < MAX_MULTI_CLAP) {
        const increment = Math.min(
          this._bufferedClaps,
          MAX_MULTI_CLAP - this._totalClaps
        );
        updateClaps(this.api, increment, this.url);
        this._totalClaps += increment;
        this._bufferedClaps = 0;
      }
    }, 2000);

    this.addEventListener("mousedown", event => {
      if (event.button !== 0) {
        return;
      }

      this.classList.add("clapped");
      if (this.classList.contains("clap-limit-exceeded")) {
        return;
      }

      // fire a DOM event with the updated count
      const clapCount =
        Number(this._countElement.innerHTML.replace(",", "")) + 1;
      this.dispatchEvent(
        new CustomEvent("clapped", {
          bubbles: true,
          detail: {
            clapCount
          }
        })
      );

      // trigger the animation
      toggleClass(this, "clap");

      // buffer the increased count and defer the update
      this._bufferedClaps++;
      this._updateClaps();

      // increment the clap count after a small pause (to allow the animation to run)
      setTimeout(() => {
        this._countElement.innerHTML = formatClaps(clapCount);
      }, 250);

      // check whether we've exceeded the max claps
      if (this.multiclap) {
        if (this._bufferedClaps + this._totalClaps >= MAX_MULTI_CLAP) {
          this.classList.add("clap-limit-exceeded");
        }
      } else {
        this.classList.add("clap-limit-exceeded");
      }
    });

    getClaps(this.api, this.url).then(claps => {
      this.classList.remove("loading");
      const clapCount = Number(claps);
      initialClapCountResolve(clapCount);
      if (clapCount > 0) {
        this._countElement.innerHTML = formatClaps(clapCount);
      }
    });

    this._connected = true;
  }

  get initialClapCount() {
    return this._initialClapCount;
  }

  get color() {
    return this.getAttribute("color");
  }

  set api(api) {
    if (api) {
      this.setAttribute("api", api);
    } else {
      this.removeAttribute("api");
    }
  }

  get api() {
    return this.getAttribute("api") || API;
  }

  set color(color) {
    if (color) {
      this.setAttribute("color", color);
    } else {
      this.removeAttribute("color");
    }
    this._updateRootColor();
  }

  set url(url) {
    if (url) {
      this.setAttribute("url", url);
    } else {
      this.removeAttribute("url");
    }
    this._updateRootColor();
  }

  get url() {
    return this.getAttribute("url");
  }

  get multiclap() {
    return this.getAttribute("multiclap") === "true";
  }

  set multiclap(multiclap) {
    if (multiclap) {
      this.setAttribute("multiclap", multiclap ? "true" : "false");
    } else {
      this.removeAttribute("multiclap");
    }
  }

  static get observedAttributes() {
    return ["color"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this._updateRootColor();
  }

  // propagates the color property to the various elements
  // that make up the applause button
  _updateRootColor() {
    if (!this._styleRootElement) {
      return;
    }
    const rootColor = this.getAttribute("color") || "green";
    const style = this._styleRootElement.style;
    style.fill = rootColor;
    style.stroke = rootColor;
    style.color = rootColor;
  }
}

customElements.define("applause-button", ApplauseButton);
