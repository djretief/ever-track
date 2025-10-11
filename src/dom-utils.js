/**
 * EverTrack DOM Utilities Module
 * Handles DOM manipulation and UI updates
 */

// Prevent multiple declarations
if (!window.EverTrackDOM) {
  const EverTrackDOM = {
    /**
     * Show element
     * @param {HTMLElement} element - Element to show
     */
    show(element) {
      if (element) {
        element.style.display = '';
        element.classList.remove('hidden');
      }
    },

    /**
     * Hide element
     * @param {HTMLElement} element - Element to hide
     */
    hide(element) {
      if (element) {
        element.style.display = 'none';
        element.classList.add('hidden');
      }
    },

    /**
     * Set text content safely
     * @param {HTMLElement} element - Element to update
     * @param {string} text - Text to set
     */
    setText(element, text) {
      if (element) {
        element.textContent = text;
      }
    },

    /**
     * Set HTML content safely
     * @param {HTMLElement} element - Element to update
     * @param {string} html - HTML to set
     */
    setHTML(element, html) {
      if (element) {
        element.innerHTML = html;
      }
    },

    /**
     * Add CSS class
     * @param {HTMLElement} element - Element to update
     * @param {string} className - Class to add
     */
    addClass(element, className) {
      if (element && className) {
        element.classList.add(className);
      }
    },

    /**
     * Remove CSS class
     * @param {HTMLElement} element - Element to update
     * @param {string} className - Class to remove
     */
    removeClass(element, className) {
      if (element && className) {
        element.classList.remove(className);
      }
    },

    /**
     * Clear all classes from element
     * @param {HTMLElement} element - Element to update
     * @param {Array<string>} classesToKeep - Classes to preserve
     */
    clearClasses(element, classesToKeep = []) {
      if (element) {
        const currentClasses = Array.from(element.classList);
        currentClasses.forEach((className) => {
          if (!classesToKeep.includes(className)) {
            element.classList.remove(className);
          }
        });
      }
    },

    /**
     * Update progress bar display
     * @param {Object} elements - DOM elements object
     * @param {Object} progress - Progress calculation result
     */
    updateProgressBar(elements, progress) {
      const { progressFill, progressText, workedHours, targetHours, statusInfo } = elements;

      // Update text elements
      this.setText(workedHours, progress.formattedWorked);
      this.setText(targetHours, progress.formattedExpected);
      this.setText(statusInfo, progress.status);

      // Update progress bar
      if (progressFill) {
        // Clear existing classes
        this.clearClasses(progressFill, ['progress-fill']);

        // Add appropriate class
        this.addClass(progressFill, progress.className);

        // Set width based on fillWidth (which is 0-50% range)
        // Convert to actual percentage for the half of the bar
        const widthPercent = (progress.fillWidth / 50) * 50; // Convert fillWidth to 0-50% range
        progressFill.style.width = `${widthPercent}%`;

        // Clear any transform
        progressFill.style.transform = '';

        console.log(
          `EverTrack DOM: Updated progress bar - fillWidth: ${progress.fillWidth}%, actual width: ${widthPercent}%, class: ${progress.className}`,
        );
      }

      // Update progress text
      if (progressText) {
        let progressTextInput = `${Math.round(progress.difference * 10) / 10}h`;
        if (progress.difference >= 0) {progressTextInput = `+${Math.round(progress.difference * 10) / 10}h`;}
        this.setText(progressText, progressTextInput);

        // Simple centered positioning without scale compensation
        progressText.style.transform = 'translate(-50%, -50%)';
      }
    },

    /**
     * Show error message
     * @param {HTMLElement} errorElement - Error display element
     * @param {string} message - Error message
     * @param {HTMLElement} contentElement - Content element to hide (optional)
     */
    showError(errorElement, message, contentElement = null) {
      if (errorElement) {
        this.setText(errorElement, message);
        this.show(errorElement);
      }

      if (contentElement) {
        this.hide(contentElement);
      }
    },

    /**
     * Show loading state
     * @param {HTMLElement} loadingElement - Loading display element
     * @param {HTMLElement} contentElement - Content element to hide (optional)
     */
    showLoading(loadingElement, contentElement = null) {
      if (loadingElement) {
        this.show(loadingElement);
      }

      if (contentElement) {
        this.hide(contentElement);
      }
    },

    /**
     * Show content (hide loading and error states)
     * @param {HTMLElement} contentElement - Content element to show
     * @param {HTMLElement} loadingElement - Loading element to hide (optional)
     * @param {HTMLElement} errorElement - Error element to hide (optional)
     */
    showContent(contentElement, loadingElement = null, errorElement = null) {
      if (contentElement) {
        this.show(contentElement);
      }

      if (loadingElement) {
        this.hide(loadingElement);
      }

      if (errorElement) {
        this.hide(errorElement);
      }
    },

    /**
     * Create DOM element with attributes
     * @param {string} tagName - Element tag name
     * @param {Object} attributes - Element attributes
     * @param {string} textContent - Element text content (optional)
     * @returns {HTMLElement} - Created element
     */
    createElement(tagName, attributes = {}, textContent = '') {
      const element = document.createElement(tagName);

      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else if (key === 'style') {
          Object.assign(element.style, value);
        } else {
          element.setAttribute(key, value);
        }
      });

      if (textContent) {
        element.textContent = textContent;
      }

      return element;
    },

    /**
     * Animate element with CSS transition
     * @param {HTMLElement} element - Element to animate
     * @param {Object} styles - CSS styles to apply
     * @param {number} duration - Animation duration in ms
     * @returns {Promise<void>} - Promise that resolves when animation completes
     */
    animate(element, styles, duration = 300) {
      return new Promise((resolve) => {
        if (!element) {
          resolve();
          return;
        }

        // Set transition
        element.style.transition = `all ${duration}ms ease`;

        // Apply styles
        Object.assign(element.style, styles);

        // Wait for animation to complete
        setTimeout(() => {
          element.style.transition = '';
          resolve();
        }, duration);
      });
    },

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    },
  };

  // Export for use in different contexts
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EverTrackDOM;
  }
  if (typeof window !== 'undefined') {
    window.EverTrackDOM = EverTrackDOM;
  }
}
