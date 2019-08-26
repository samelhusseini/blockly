/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldDropdown');

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.Menu');
goog.require('Blockly.MenuItem');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Size');
goog.require('Blockly.utils.string');
goog.require('Blockly.utils.uiMenu');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a language-neutral dropdown
 *    option & returns a validated language-neutral dropdown option, or null to
 *    abort the change.
 * @extends {Blockly.Field<string>}
 * @constructor
 */
Blockly.FieldDropdown = function(menuGenerator, opt_validator) {
  if (typeof menuGenerator != 'function') {
    Blockly.FieldDropdown.validateOptions_(menuGenerator);
  }
  this.menuGenerator_ = menuGenerator;

  this.trimOptions_();
  var firstTuple = this.getOptions()[0];

  // Call parent's constructor.
  Blockly.FieldDropdown.superClass_.constructor.call(this, firstTuple[1],
      opt_validator);
};
goog.inherits(Blockly.FieldDropdown, Blockly.Field);

/**
 * Construct a FieldDropdown from a JSON arg object.
 * @param {!Object} options A JSON object with options (options).
 * @return {!Blockly.FieldDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldDropdown.fromJson = function(options) {
  return new Blockly.FieldDropdown(options['options']);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 * @suppress {constantProperty}
 */
Blockly.FieldDropdown.prototype.SERIALIZABLE = true;

/**
 * Horizontal distance that a checkmark overhangs the dropdown.
 */
Blockly.FieldDropdown.CHECKMARK_OVERHANG = 25;

/**
 * Maximum height of the dropdown menu, as a percentage of the viewport height.
 */
Blockly.FieldDropdown.MAX_MENU_HEIGHT_VH = 0.45;

/**
 * The y offset from the top of the field to the top of the image, if an image
 * is selected.
 * @type {number}
 * @const
 * @private
 */
Blockly.FieldDropdown.IMAGE_Y_OFFSET = 5;

/**
 * The total vertical padding above and below an image.
 * @type {number}
 * @const
 * @private
 */
Blockly.FieldDropdown.IMAGE_Y_PADDING = Blockly.FieldDropdown.IMAGE_Y_OFFSET * 2;

/**
 * Android can't (in 2014) display "▾", so use "▼" instead.
 */
Blockly.FieldDropdown.ARROW_CHAR =
    Blockly.utils.userAgent.ANDROID ? '\u25BC' : '\u25BE';

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDropdown.prototype.CURSOR = 'default';

/**
 * SVG image element if currently selected option is an image, or null.
 * @type {SVGElement}
 * @private
 */
Blockly.FieldDropdown.prototype.imageElement_ = null;

/**
 * Object with src, height, width, and alt attributes if currently selected
 * option is an image, or null.
 * @type {Object}
 * @private
 */
Blockly.FieldDropdown.prototype.imageJson_ = null;

/**
 * Create the block UI for this dropdown.
 * @package
 */
Blockly.FieldDropdown.prototype.initView = function() {
  Blockly.FieldDropdown.superClass_.initView.call(this);

  this.imageElement_ = Blockly.utils.dom.createSvgElement( 'image',
      {
        'y': Blockly.FieldDropdown.IMAGE_Y_OFFSET
      }, this.fieldGroup_);

  this.arrow_ = Blockly.utils.dom.createSvgElement('tspan', {}, this.textElement_);
  this.arrow_.appendChild(document.createTextNode(
      this.sourceBlock_.RTL ?
      Blockly.FieldDropdown.ARROW_CHAR + ' ' :
      ' ' + Blockly.FieldDropdown.ARROW_CHAR));
  if (this.sourceBlock_.RTL) {
    this.textElement_.insertBefore(this.arrow_, this.textContent_);
  } else {
    this.textElement_.appendChild(this.arrow_);
  }
};

/**
 * Create a dropdown menu under the text.
 * @private
 */
Blockly.FieldDropdown.prototype.showEditor_ = function() {
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL,
      this.widgetDispose_.bind(this));
  this.menu_ = this.widgetCreate_();

  this.menu_.render(Blockly.WidgetDiv.DIV);
  // Element gets created in render.
  Blockly.utils.dom.addClass(
      /** @type {!Element} */ (this.menu_.getElement()), 'blocklyDropdownMenu');

  this.positionMenu_(this.menu_);

  // Focusing needs to be handled after the menu is rendered and positioned.
  // Otherwise it will cause a page scroll to get the misplaced menu in
  // view. See issue #1329.
  this.menu_.focus();
};

/**
 * Create the dropdown editor widget.
 * @return {Blockly.Menu} The newly created dropdown menu.
 * @private
 */
Blockly.FieldDropdown.prototype.widgetCreate_ = function() {
  var menu = new Blockly.Menu();
  menu.setRightToLeft(this.sourceBlock_.RTL);
  menu.setRole('listbox');

  var options = this.getOptions();
  var selectedMenuItem;
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0]; // Human-readable text or image.
    var value = options[i][1];   // Language-neutral value.
    if (typeof content == 'object') {
      // An image, not text.
      var image = new Image(content['width'], content['height']);
      image.src = content['src'];
      image.alt = content['alt'] || '';
      content = image;
    }
    var menuItem = new Blockly.MenuItem(content);
    menuItem.setRole('option');
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setValue(value);
    menuItem.setCheckable(true);
    menu.addChild(menuItem, true);
    menuItem.setChecked(value == this.value_);
    if (value == this.value_) {
      selectedMenuItem = menuItem;
    }
    menuItem.onAction(this.handleMenuActionEvent_, this);
  }

  Blockly.utils.aria.setState(/** @type {!Element} */ (menu.getElement()),
      Blockly.utils.aria.State.ACTIVEDESCENDANT,
      selectedMenuItem ? selectedMenuItem.getId() : '');

  return menu;
};

/**
 * Dispose of events belonging to the dropdown editor.
 * @private
 */
Blockly.FieldDropdown.prototype.widgetDispose_ = function() {
  this.menu_.dispose();
};

/**
 * Handle an action in the dropdown menu.
 * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
 * @private
 */
Blockly.FieldDropdown.prototype.handleMenuActionEvent_ = function(menuItem) {
  Blockly.WidgetDiv.hideIfOwner(this);
  this.onItemSelected(this.menu_, menuItem);
};

/**
 * Place the menu correctly on the screen, taking into account the dimensions
 * of the menu and the dimensions of the screen so that it doesn't run off any
 * edges.
 * @param {!Blockly.Menu} menu The menu to position.
 * @private
 */
Blockly.FieldDropdown.prototype.positionMenu_ = function(menu) {
  var viewportBBox = Blockly.utils.getViewportBBox();
  var anchorBBox = this.getAnchorDimensions_();

  var menuSize = Blockly.utils.uiMenu.getSize(menu);

  var menuMaxHeightPx = Blockly.FieldDropdown.MAX_MENU_HEIGHT_VH *
      document.documentElement.clientHeight;
  if (menuSize.height > menuMaxHeightPx) {
    menuSize.height = menuMaxHeightPx;
  }

  if (this.sourceBlock_.RTL) {
    Blockly.utils.uiMenu.adjustBBoxesForRTL(viewportBBox, anchorBBox, menuSize);
  }
  Blockly.WidgetDiv.positionWithAnchor(viewportBBox, anchorBBox, menuSize,
      this.sourceBlock_.RTL);
};

/**
 * Returns the coordinates of the anchor rectangle for the widget div.
 * On a FieldDropdown we take the top-left corner of the field, then adjust for
 * the size of the checkmark that is displayed next to the currently selected
 * item. This means that the item text will be positioned directly under the
 * field text, rather than offset slightly.
 * @return {!Object} The bounding rectangle of the anchor, in window
 *     coordinates.
 * @private
 */
Blockly.FieldDropdown.prototype.getAnchorDimensions_ = function() {
  var boundingBox = this.getScaledBBox_();
  if (this.sourceBlock_.RTL) {
    boundingBox.right += Blockly.FieldDropdown.CHECKMARK_OVERHANG;
  } else {
    boundingBox.left -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;
  }

  return boundingBox;
};

/**
 * Handle the selection of an item in the dropdown menu.
 * @param {!Blockly.Menu} menu The Menu component clicked.
 * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldDropdown.prototype.onItemSelected = function(menu, menuItem) {
  this.setValue(/** @type {string} */ (menuItem.getValue()));
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
Blockly.FieldDropdown.prototype.trimOptions_ = function() {
  this.prefixField = null;
  this.suffixField = null;
  var options = this.menuGenerator_;
  if (!Array.isArray(options)) {
    return;
  }
  var hasImages = false;

  // Localize label text and image alt text.
  for (var i = 0; i < options.length; i++) {
    var label = options[i][0];
    if (typeof label == 'string') {
      options[i][0] = Blockly.utils.replaceMessageReferences(label);
    } else {
      if (label.alt != null) {
        options[i][0].alt = Blockly.utils.replaceMessageReferences(label.alt);
      }
      hasImages = true;
    }
  }
  if (hasImages || options.length < 2) {
    return;  // Do nothing if too few items or at least one label is an image.
  }
  var strings = [];
  for (var i = 0; i < options.length; i++) {
    strings.push(options[i][0]);
  }
  var shortest = Blockly.utils.string.shortestStringLength(strings);
  var prefixLength = Blockly.utils.string.commonWordPrefix(strings, shortest);
  var suffixLength = Blockly.utils.string.commonWordSuffix(strings, shortest);
  if (!prefixLength && !suffixLength) {
    return;
  }
  if (shortest <= prefixLength + suffixLength) {
    // One or more strings will entirely vanish if we proceed.  Abort.
    return;
  }
  if (prefixLength) {
    this.prefixField = strings[0].substring(0, prefixLength - 1);
  }
  if (suffixLength) {
    this.suffixField = strings[0].substr(1 - suffixLength);
  }

  this.menuGenerator_ = Blockly.FieldDropdown.applyTrim_(options, prefixLength,
      suffixLength);
};

/**
 * Use the calculated prefix and suffix lengths to trim all of the options in
 * the given array.
 * @param {!Array.<!Array>} options Array of option tuples:
 *     (human-readable text or image, language-neutral name).
 * @param {number} prefixLength The length of the common prefix.
 * @param {number} suffixLength The length of the common suffix
 * @return {!Array.<!Array>} A new array with all of the option text trimmed.
 */
Blockly.FieldDropdown.applyTrim_ = function(options,
    prefixLength, suffixLength) {
  var newOptions = [];
  // Remove the prefix and suffix from the options.
  for (var i = 0; i < options.length; i++) {
    var text = options[i][0];
    var value = options[i][1];
    text = text.substring(prefixLength, text.length - suffixLength);
    newOptions[i] = [text, value];
  }
  return newOptions;
};

/**
 * @return {boolean} True if the option list is generated by a function.
 *     Otherwise false.
 */
Blockly.FieldDropdown.prototype.isOptionListDynamic = function() {
  return typeof this.menuGenerator_ == 'function';
};

/**
 * Return a list of the options for this dropdown.
 * @return {!Array.<!Array>} Array of option tuples:
 *     (human-readable text or image, language-neutral name).
 * @throws If generated options are incorrectly structured.
 */
Blockly.FieldDropdown.prototype.getOptions = function() {
  if (this.isOptionListDynamic()) {
    var generatedOptions = this.menuGenerator_.call(this);
    Blockly.FieldDropdown.validateOptions_(generatedOptions);
    return generatedOptions;
  }
  return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
};

/**
 * Ensure that the input value is a valid language-neutral option.
 * @param {string=} opt_newValue The input value.
 * @return {?string} A valid language-neutral option, or null if invalid.
 * @protected
 */
Blockly.FieldDropdown.prototype.doClassValidation_ = function(opt_newValue) {
  var isValueValid = false;
  var options = this.getOptions();
  for (var i = 0, option; option = options[i]; i++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (option[1] == opt_newValue) {
      isValueValid = true;
      break;
    }
  }
  if (!isValueValid) {
    if (this.sourceBlock_) {
      console.warn('Cannot set the dropdown\'s value to an unavailable option.' +
        ' Block type: ' + this.sourceBlock_.type + ', Field name: ' + this.name +
        ', Value: ' + opt_newValue);
    }
    return null;
  }
  return opt_newValue || null;
};

/**
 * Update the value of this dropdown field.
 * @param {string} newValue The new language-neutral value.
 * @protected
 */
Blockly.FieldDropdown.prototype.doValueUpdate_ = function(newValue) {
  Blockly.FieldDropdown.superClass_.doValueUpdate_.call(this, newValue);
  var options = this.getOptions();
  for (var i = 0, option; option = options[i]; i++) {
    if (option[1] == this.value_) {
      var content = option[0];
      if (typeof content == 'object') {
        this.imageJson_ = content;
        this.text_ = content.alt;
      } else {
        this.imageJson_ = null;
        this.text_ = content;
      }
    }
  }
};

/**
 * Updates the dropdown arrow to match the colour/style of the block.
 * @package
 */
Blockly.FieldDropdown.prototype.updateColour = function() {
  // Update arrow's colour.
  if (this.sourceBlock_ && this.arrow_) {
    if (this.sourceBlock_.isShadow()) {
      this.arrow_.style.fill = this.sourceBlock_.getColourShadow();
    } else {
      this.arrow_.style.fill = this.sourceBlock_.getColour();
    }
  }
};

/**
 * Draws the border with the correct width.
 * @private
 */
Blockly.FieldDropdown.prototype.render_ = function() {
  // Hide both elements.
  this.textContent_.nodeValue = '';
  this.imageElement_.style.display = 'none';

  // Show correct element.
  if (this.imageJson_) {
    this.renderSelectedImage_();
  } else {
    this.renderSelectedText_();
  }
  this.borderRect_.setAttribute('height', this.size_.height);
  this.borderRect_.setAttribute('width', this.size_.width);
};

/**
 * Renders the selected option, which must be an image.
 * @private
 */
Blockly.FieldDropdown.prototype.renderSelectedImage_ = function() {
  this.imageElement_.style.display = '';
  this.imageElement_.setAttributeNS(
      Blockly.utils.dom.XLINK_NS, 'xlink:href', this.imageJson_.src);
  this.imageElement_.setAttribute('height', this.imageJson_.height);
  this.imageElement_.setAttribute('width', this.imageJson_.width);

  var arrowWidth = Blockly.utils.dom.getTextWidth(this.arrow_);

  var imageHeight = Number(this.imageJson_.height);
  var imageWidth = Number(this.imageJson_.width);

  // Height and width include the border rect.
  this.size_.height = imageHeight + Blockly.FieldDropdown.IMAGE_Y_PADDING;
  this.size_.width = imageWidth + arrowWidth + Blockly.Field.X_PADDING;

  if (this.sourceBlock_.RTL) {
    var imageX = Blockly.Field.DEFAULT_TEXT_OFFSET + arrowWidth;
    var arrowX = Blockly.Field.DEFAULT_TEXT_OFFSET - 1;
    this.imageElement_.setAttribute('x', imageX);
    this.textElement_.setAttribute('x', arrowX);
  } else {
    var arrowX = imageWidth + arrowWidth + Blockly.Field.DEFAULT_TEXT_OFFSET + 1;
    this.textElement_.setAttribute('text-anchor', 'end');
    this.textElement_.setAttribute('x', arrowX);
    this.imageElement_.setAttribute('x', Blockly.Field.DEFAULT_TEXT_OFFSET);
  }
};

/**
 * Renders the selected option, which must be text.
 * @private
 */
Blockly.FieldDropdown.prototype.renderSelectedText_ = function() {
  this.textContent_.nodeValue = this.getDisplayText_();
  this.textElement_.setAttribute('text-anchor', 'start');
  this.textElement_.setAttribute('x', Blockly.Field.DEFAULT_TEXT_OFFSET);
  // Height and width include the border rect.
  this.size_.height = Blockly.Field.BORDER_RECT_DEFAULT_HEIGHT;
  this.size_.width = Blockly.utils.dom.getTextWidth(this.textElement_) +
      Blockly.Field.X_PADDING;
};

/**
 * Validates the data structure to be processed as an options list.
 * @param {?} options The proposed dropdown options.
 * @throws If proposed options are incorrectly structured.
 * @private
 */
Blockly.FieldDropdown.validateOptions_ = function(options) {
  if (!Array.isArray(options)) {
    throw TypeError('FieldDropdown options must be an array.');
  }
  var foundError = false;
  for (var i = 0; i < options.length; ++i) {
    var tuple = options[i];
    if (!Array.isArray(tuple)) {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option must be an ' +
          'array. Found: ', tuple);
    } else if (typeof tuple[1] != 'string') {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option id must be ' +
          'a string. Found ' + tuple[1] + ' in: ', tuple);
    } else if ((typeof tuple[0] != 'string') &&
               (typeof tuple[0].src != 'string')) {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option must have a ' +
          'string label or image description. Found' + tuple[0] + ' in: ',
          tuple);
    }
  }
  if (foundError) {
    throw TypeError('Found invalid FieldDropdown options.');
  }
};

Blockly.fieldRegistry.register('field_dropdown', Blockly.FieldDropdown);
