/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a theme.
 */
'use strict';

goog.provide('Blockly.Theme');

goog.require('Blockly.utils');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');


/**
 * Class for a theme.
 * @param {string} name Theme name.
 * @param {!Object.<string, Blockly.Theme.BlockStyle>=} opt_blockStyles A map
 *     from style names (strings) to objects with style attributes for blocks.
 * @param {!Object.<string, Blockly.Theme.CategoryStyle>=} opt_categoryStyles A
 *     map from style names (strings) to objects with style attributes for
 *     categories.
 * @param {!Object.<string, *>=} opt_componentStyles A map of Blockly component
 *     names to style value.
 * @constructor
 */
Blockly.Theme = function(name, opt_blockStyles, opt_categoryStyles,
    opt_componentStyles) {

  /**
   * The theme name. This can be used to reference a specific theme in CSS.
   * @type {string}
   * @package
   */
  this.name = name;

  /**
   * The block styles map.
   * @type {!Object.<string, !Blockly.Theme.BlockStyle>}
   * @package
   */
  this.blockStyles = opt_blockStyles || Object.create(null);

  /**
   * The category styles map.
   * @type {!Object.<string, Blockly.Theme.CategoryStyle>}
   * @package
   */
  this.categoryStyles = opt_categoryStyles || Object.create(null);

  /**
   * The UI components styles map.
   * @type {!Object.<string, *>}
   * @package
   */
  this.componentStyles = opt_componentStyles || Object.create(null);

  /**
   * @type {!Object.<string, !Array.<Blockly.Theme.CSSRule>>}
   * @package
   */
  this.cssRules = Object.create(null);

  /**
   * The font style.
   * @type {Blockly.Theme.FontStyle}
   * @package
   */
  this.fontStyle = /** @type {Blockly.Theme.FontStyle} */ (Object.create(null));

  /**
   * The <style> element to use for injecting renderer specific CSS.
   * @type {HTMLStyleElement}
   * @private
   */
  this.cssNode_ = null;
};

/**
 * A block style.
 * @typedef {{
 *            colourPrimary:string,
 *            colourSecondary:string,
 *            colourTertiary:string,
 *            hat:string
 *          }}
 */
Blockly.Theme.BlockStyle;

/**
 * A category style.
 * @typedef {{
 *            colour:string
 *          }}
 */
Blockly.Theme.CategoryStyle;

/**
 * A font style.
 * @typedef {{
 *            family:string?,
 *            weight:string?,
 *            size:number?
 *          }}
 */
Blockly.Theme.FontStyle;

/**
 * A CSS style.
 * @typedef {{
  *            selector:string,
  *            property:string,
  *            value:string,
  *            isTopLevel:?boolean,
  *          }}
  */
Blockly.Theme.CSSRule;

/**
 * Overrides or adds a style to the blockStyles map.
 * @param {string} blockStyleName The name of the block style.
 * @param {Blockly.Theme.BlockStyle} blockStyle The block style.
*/
Blockly.Theme.prototype.setBlockStyle = function(blockStyleName, blockStyle) {
  this.blockStyles[blockStyleName] = blockStyle;
};

/**
 * Overrides or adds a style to the categoryStyles map.
 * @param {string} categoryStyleName The name of the category style.
 * @param {Blockly.Theme.CategoryStyle} categoryStyle The category style.
*/
Blockly.Theme.prototype.setCategoryStyle = function(categoryStyleName,
    categoryStyle) {
  this.categoryStyles[categoryStyleName] = categoryStyle;
};

/**
 * Configure a theme's font style.
 * @param {Blockly.Theme.FontStyle} fontStyle The font style.
*/
Blockly.Theme.prototype.setFontStyle = function(fontStyle) {
  this.fontStyle = fontStyle;
};

/**
 * Overrides or adds a style to the categoryStyles map.
 * @param {string|!Array.<string>} selectors The name of the category style.
 * @param {string} property The category style.
 * @param {string} value The category style.
 * @param {boolean=} opt_isTopLevel Whether or not this selector is a top level
 *     selector.
*/
Blockly.Theme.prototype.addCSSRule = function(selectors, property, value,
    opt_isTopLevel) {
  if (!Array.isArray(selectors)) {
    selectors = [selectors];
  }
  for (var i = 0, selector; (selector = selectors[i]); i++) {
    if (!this.cssRules[selector]) {
      this.cssRules[selector] = [];
    }
    this.cssRules[selector].push({
      selector: selector,
      property: property,
      value: value,
      isTopLevel: opt_isTopLevel || null
    });
  }
};

/**
 * Inject theme specific CSS into the page.
 * @package
 */
Blockly.Theme.prototype.injectCSS = function() {
  var cssNodeId = 'blockly-theme-style-' + this.name;
  this.cssNode_ = Blockly.utils.dom.injectCSS(cssNodeId, this.getCSS_());
};

/**
 * Dispose of this theme.
 * Removes any theme specific CSS from the page.
 * @package
 */
Blockly.Theme.prototype.dispose = function() {
  if (this.cssNode_) {
    Blockly.utils.dom.removeNode(this.cssNode_);
  }
};

/**
 * Get any theme specific CSS to inject when the theme is attached to a
 * workspace.
 * @return {string} A CSS string.
 * @private
 */
Blockly.Theme.prototype.getCSS_ = function() {
  var selectors = Object.keys(this.cssRules);
  var themeSelector = '.' + this.name + '-theme';
  var css = '';
  for (var i = 0, selector; (selector = selectors[i]); i++) {
    var rules = this.cssRules[selector];
    for (var j = 0, rule; (rule = rules[j]); j++) {
      css += themeSelector + (rule.isTopLevel ? '' : ' ') + selector + '{\n' +
        rule.property + ':' + rule.value + ';\n' + '}\n';
    }
  }
  return css;
};

/**
 * Gets the style for a given Blockly UI component.  If the style value is a
 * string, we attempt to find the value of any named references.
 * @param {string} componentName The name of the component.
 * @return {?string} The style value.
 */
Blockly.Theme.prototype.getComponentStyle = function(componentName) {
  var style = this.componentStyles[componentName];
  if (style && typeof propertyValue == 'string' &&
      this.getComponentStyle(/** @type {string} */ (style))) {
    return this.getComponentStyle(/** @type {string} */ (style));
  }
  return style ? String(style) : null;
};

/**
 * Configure a specific Blockly UI component with a style value.
 * @param {string} componentName The name of the component.
 * @param {*} styleValue The style value.
*/
Blockly.Theme.prototype.setComponentStyle = function(componentName,
    styleValue) {
  this.componentStyles[componentName] = styleValue;
};

/**
 * Define a new Blockly theme.
 * @param {string} name The name of the theme.
 * @param {Object} themeObj An object containing theme properties.
 * @return {!Blockly.Theme} A new Blockly theme.
*/
Blockly.Theme.defineTheme = function(name, themeObj) {
  var theme = new Blockly.Theme(name);
  var base = themeObj['base'];
  if (base && base instanceof Blockly.Theme) {
    Blockly.utils.object.mixin(theme.blockStyles, base.blockStyles);
    Blockly.utils.object.mixin(theme.categoryStyles, base.categoryStyles);
    Blockly.utils.object.mixin(theme.componentStyles, base.componentStyles);
    Blockly.utils.object.mixin(theme.cssRules, base.cssRules);
  }
  Blockly.utils.object.mixin(theme.blockStyles, themeObj['blockStyles']);
  Blockly.utils.object.mixin(theme.categoryStyles, themeObj['categoryStyles']);
  Blockly.utils.object.mixin(theme.componentStyles, themeObj['componentStyles']);
  Blockly.utils.object.mixin(theme.fontStyle, themeObj['fontStyle']);
  return theme;
};
