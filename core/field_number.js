/**
 * @license
 * Copyright 2016 Google LLC
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
 * @fileoverview Number input field
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FieldNumber');

goog.require('Blockly.fieldRegistry');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.object');


/**
 * Class for an editable number field.
 * @param {string|number=} opt_value The initial value of the field. Should cast
 *    to a number. Defaults to 0.
 * @param {?(string|number)=} opt_min Minimum value.
 * @param {?(string|number)=} opt_max Maximum value.
 * @param {?(string|number)=} opt_precision Precision for value.
 * @param {?Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a number & returns a validated
 *    number, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldNumber = function(opt_value, opt_min, opt_max, opt_precision,
    opt_validator, opt_config) {

  /**
   * The minimum value this number field can contain.
   * @type {number}
   * @protected
   */
  this.min_ = -Infinity;

  /**
   * The maximum value this number field can contain.
   * @type {number}
   * @protected
   */
  this.max_ = Infinity;

  /**
   * The multiple to which this fields value is rounded.
   * @type {number}
   * @protected
   */
  this.precision_ = 0;

  /**
   * The number of decimal places to allow, or null to allow any number of
   * decimal digits.
   * @type {?number}
   * @private
   */
  this.decimalPlaces_ = null;

  Blockly.FieldNumber.superClass_.constructor.call(
      this, opt_value || 0, opt_validator, opt_config);

  if (!opt_config) {  // Only do one kind of configuration or the other.
    this.setConstraints(opt_min, opt_max, opt_precision);
  }
};
Blockly.utils.object.inherits(Blockly.FieldNumber, Blockly.FieldTextInput);

/**
 * Construct a FieldNumber from a JSON arg object.
 * @param {!Object} options A JSON object with options (value, min, max, and
 *                          precision).
 * @return {!Blockly.FieldNumber} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldNumber.fromJson = function(options) {
  return new Blockly.FieldNumber(options['value'],
      undefined, undefined, undefined, undefined, options);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
Blockly.FieldNumber.prototype.SERIALIZABLE = true;

/**
 * Fixed width of the num-pad drop-down, in px.
 * @type {number}
 * @const
 */
Blockly.FieldNumber.NUMPAD_WIDTH = 168;

/**
 * Buttons for the num-pad, in order from the top left.
 * @type {Array.<string>}
 * @const
 */
Blockly.FieldNumber.NUMPAD_BUTTONS =
    ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '-', ' '];

/**
 * Src for the delete icon to be shown on the num-pad.
 * @type {string}
 * @const
 */
Blockly.FieldNumber.NUMPAD_DELETE_ICON =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZD0iTTI4Ljg5LDExLjQ1SDE2Ljc5YT' +
    'IuODYsMi44NiwwLDAsMC0yLC44NEw5LjA5LDE4YTIuODUsMi44NSwwLDAsMCwwLDRsNS42OS' +
    'w1LjY5YTIuODYsMi44NiwwLDAsMCwyLC44NGgxMi4xYTIuODYsMi44NiwwLDAsMCwyLjg2LT' +
    'IuODZWMTQuMzFBMi44NiwyLjg2LDAsMCwwLDI4Ljg5LDExLjQ1Wk0yNy4xNSwyMi43M2ExLD' +
    'EsMCwwLDEsMCwxLjQxLDEsMSwwLDAsMS0uNzEuMywxLDEsMCwwLDEtLjcxLTAuM0wyMywyMS' +
    '40MWwtMi43MywyLjczYTEsMSwwLDAsMS0xLjQxLDAsMSwxLDAsMCwxLDAtMS40MUwyMS41OS' +
    'wyMGwtMi43My0yLjczYTEsMSwwLDAsMSwwLTEuNDEsMSwxLDAsMCwxLDEuNDEsMEwyMywxOC' +
    '41OWwyLjczLTIuNzNhMSwxLDAsMSwxLDEuNDIsMS40MUwyNC40MiwyMFoiIGZpbGw9IiNmZm' +
    'ZmZmYiLz48L3N2Zz4=';
  
/**
 * Configure the field based on the given map of options.
 * @param {!Object} config A map of options to configure the field based on.
 * @private
 */
Blockly.FieldNumber.prototype.configure_ = function(config) {
  Blockly.FieldNumber.superClass_.configure_.call(this, config);
  this.setMinInternal_(config['min']);
  this.setMaxInternal_(config['max']);
  this.setPrecisionInternal_(config['precision']);
};

/**
 * Set the maximum, minimum and precision constraints on this field.
 * Any of these properties may be undefined or NaN to be disabled.
 * Setting precision (usually a power of 10) enforces a minimum step between
 * values. That is, the user's value will rounded to the closest multiple of
 * precision. The least significant digit place is inferred from the precision.
 * Integers values can be enforces by choosing an integer precision.
 * @param {?(number|string|undefined)} min Minimum value.
 * @param {?(number|string|undefined)} max Maximum value.
 * @param {?(number|string|undefined)} precision Precision for value.
 */
Blockly.FieldNumber.prototype.setConstraints = function(min, max, precision) {
  this.setMinInternal_(min);
  this.setMaxInternal_(max);
  this.setPrecisionInternal_(precision);
  this.setValue(this.getValue());
};

/**
 * Sets the minimum value this field can contain. Updates the value to reflect.
 * @param {?(number|string|undefined)} min Minimum value.
 */
Blockly.FieldNumber.prototype.setMin = function(min) {
  this.setMinInternal_(min);
  this.setValue(this.getValue());
};

/**
 * Sets the minimum value this field can contain. Called internally to avoid
 * value updates.
 * @param {?(number|string|undefined)} min Minimum value.
 * @private
 */
Blockly.FieldNumber.prototype.setMinInternal_ = function(min) {
  if (min == null) {
    this.min_ = -Infinity;
  } else {
    min = Number(min);
    if (!isNaN(min)) {
      this.min_ = min;
    }
  }
};

/**
 * Returns the current minimum value this field can contain. Default is
 * -Infinity.
 * @return {number} The current minimum value this field can contain.
 */
Blockly.FieldNumber.prototype.getMin = function() {
  return this.min_;
};

/**
 * Sets the maximum value this field can contain. Updates the value to reflect.
 * @param {?(number|string|undefined)} max Maximum value.
 */
Blockly.FieldNumber.prototype.setMax = function(max) {
  this.setMaxInternal_(max);
  this.setValue(this.getValue());
};

/**
 * Sets the maximum value this field can contain. Called internally to avoid
 * value updates.
 * @param {?(number|string|undefined)} max Maximum value.
 * @private
 */
Blockly.FieldNumber.prototype.setMaxInternal_ = function(max) {
  if (max == null) {
    this.max_ = Infinity;
  } else {
    max = Number(max);
    if (!isNaN(max)) {
      this.max_ = max;
    }
  }
};

/**
 * Returns the current maximum value this field can contain. Default is
 * Infinity.
 * @return {number} The current maximum value this field can contain.
 */
Blockly.FieldNumber.prototype.getMax = function() {
  return this.max_;
};

/**
 * Sets the precision of this field's value, i.e. the number to which the
 * value is rounded. Updates the field to reflect.
 * @param {?(number|string|undefined)} precision The number to which the
 *    field's value is rounded.
 */
Blockly.FieldNumber.prototype.setPrecision = function(precision) {
  this.setPrecisionInternal_(precision);
  this.setValue(this.getValue());
};

/**
 * Sets the precision of this field's value. Called internally to avoid
 * value updates.
 * @param {?(number|string|undefined)} precision The number to which the
 *    field's value is rounded.
 * @private
 */
Blockly.FieldNumber.prototype.setPrecisionInternal_ = function(precision) {
  if (precision == null) {
    // Number(precision) would also be 0, but set explicitly to be clear.
    this.precision_ = 0;
  } else {
    precision = Number(precision);
    if (!isNaN(precision)) {
      this.precision_ = precision;
    }
  }

  var precisionString = this.precision_.toString();
  var decimalIndex = precisionString.indexOf('.');
  if (decimalIndex == -1) {
    // If the precision is 0 (float) allow any number of decimals,
    // otherwise allow none.
    this.decimalPlaces_ = precision ? 0 : null;
  } else {
    this.decimalPlaces_ = precisionString.length - decimalIndex - 1;
  }
};

/**
 * Returns the current precision of this field. The precision being the
 * number to which the field's value is rounded. A precision of 0 means that
 * the value is not rounded.
 * @return {number} The number to which this field's value is rounded.
 */
Blockly.FieldNumber.prototype.getPrecision = function() {
  return this.precision_;
};

/**
 * Ensure that the input value is a valid number (must fulfill the
 * constraints placed on the field).
 * @param {*=} opt_newValue The input value.
 * @return {?number} A valid number, or null if invalid.
 * @protected
 * @override
 */
Blockly.FieldNumber.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null) {
    return null;
  }
  // Clean up text.
  var newValue = String(opt_newValue);
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  newValue = newValue.replace(/O/ig, '0');
  // Strip out thousands separators.
  newValue = newValue.replace(/,/g, '');
  // Ignore case of 'Infinity'.
  newValue = newValue.replace(/infinity/i, 'Infinity');

  // Clean up number.
  var n = Number(newValue || 0);
  if (isNaN(n)) {
    // Invalid number.
    return null;
  }
  // Get the value in range.
  n = Math.min(Math.max(n, this.min_), this.max_);
  // Round to nearest multiple of precision.
  if (this.precision_ && isFinite(n)) {
    n = Math.round(n / this.precision_) * this.precision_;
  }
  // Clean up floating point errors.
  if (this.decimalPlaces_ != null) {
    n = Number(n.toFixed(this.decimalPlaces_));
  }
  return n;
};

/**
 * Create the number input editor widget.
 * @return {!HTMLElement} The newly created number input editor.
 * @protected
 * @override
 */
Blockly.FieldNumber.prototype.widgetCreate_ = function() {
  var htmlInput = Blockly.FieldNumber.superClass_.widgetCreate_.call(this);

  // Set the accessibility state
  if (this.min_ > -Infinity) {
    Blockly.utils.aria.setState(htmlInput,
        Blockly.utils.aria.State.VALUEMIN, this.min_);
  }
  if (this.max_ < Infinity) {
    Blockly.utils.aria.setState(htmlInput,
        Blockly.utils.aria.State.VALUEMAX, this.max_);
  }
  return htmlInput;
};

/**
 * Show the inline free-text editor on top of the text and the num-pad if
 * appropriate.
 * @param {Event=} opt_e Optional mouse event that triggered the field to open,
 *     or undefined if triggered programatically.
 * @param {?boolean=} _opt_quietInput True if editor should be created without
 *     focus. null if we should show a prompt editor on mobile.
 * @param {boolean=} _opt_readOnly True if editor should be created with HTML
 *     input set to read-only, to prevent virtual keyboards.
 * @param {boolean=} opt_showNumPad If true, show the num pad.
 * @protected
 */
Blockly.FieldNumber.prototype.showEditor_ = function(opt_e, _opt_quietInput,
    _opt_readOnly, opt_showNumPad) {
  // Do not focus on mobile devices so we can show the num-pad
  var showNumPad = (typeof opt_showNumPad !== "undefined") ? opt_showNumPad :
      this.constants_.FIELD_NUMBER_SHOW_NUMPAD;
  Blockly.FieldNumber.superClass_.showEditor_.call(this, opt_e, false,
      showNumPad);

  // Show a numeric keypad in the drop-down on touch.
  if (showNumPad) {
    this.numPadShow_();
  }
};

/**
 * Show the number pad.
 * @private
 */
Blockly.FieldNumber.prototype.numPadShow_ = function() {
  // If there is an existing drop-down someone else owns, hide it immediately
  // and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();

  // Accessibility properties
  contentDiv.setAttribute('role', 'menu');
  contentDiv.setAttribute('aria-haspopup', 'true');

  var style = this.sourceBlock_.isShadow() ?
      this.sourceBlock_.getParent().style : this.sourceBlock_.style;

  this.numpadAddButtons_(contentDiv, style);

  Blockly.DropDownDiv.setColour(style.colourPrimary, style.colourTertiary);
  contentDiv.style.width = Blockly.FieldNumber.NUMPAD_WIDTH + 'px';

  Blockly.DropDownDiv.showPositionedByField(
      this, this.widgetDispose_.bind(this));
};

/**
 * Add number, punctuation, and erase buttons to the numeric keypad's content
 * div.
 * @param {Element} contentDiv The div for the numeric keypad.
 * @param {!Blockly.Theme.BlockStyle} style The block style to use.
 * @private
 */
Blockly.FieldNumber.prototype.numpadAddButtons_ = function(contentDiv, style) {
  var buttonColour = style.colourPrimary;
  var buttonBorderColour = style.colourTertiary;

  // Add numeric keypad buttons
  var buttons = Blockly.FieldNumber.NUMPAD_BUTTONS;
  var decimalsAllowed = this.decimalPlaces_ != 0;
  var negativesAllowed = this.min_ < 0;
  for (var i = 0, buttonText; (buttonText = buttons[i]); i++) {
    var button = document.createElement('button');
    button.setAttribute('role', 'menuitem');
    button.setAttribute('class', 'blocklyNumPadButton');
    button.setAttribute('style',
        'background:' + buttonColour + ';' +
        'border: 1px solid ' + buttonBorderColour + ';');
    button.title = buttonText;
    button.innerHTML = buttonText;
    Blockly.bindEvent_(button, 'mousedown', this, this.numPadButtonTouch_);
    if (buttonText == '.' && !decimalsAllowed) {
      // Don't show the decimal point for inputs that must be round numbers
      button.setAttribute('style', 'visibility: hidden');
    } else if (buttonText == '-' && !negativesAllowed) {
      continue;
    } else if (buttonText == ' ' && !negativesAllowed) {
      continue;
    } else if (buttonText == ' ' && negativesAllowed) {
      button.setAttribute('style', 'visibility: hidden');
    }
    contentDiv.appendChild(button);
  }
  // Add erase button to the end
  var eraseButton = document.createElement('button');
  eraseButton.setAttribute('role', 'menuitem');
  eraseButton.setAttribute('class', 'blocklyNumPadButton');
  eraseButton.setAttribute('style',
      'background:' + buttonColour + ';' +
      'border: 1px solid ' + buttonBorderColour + ';');
  eraseButton.title = 'Delete';

  var eraseImage = document.createElement('img');
  eraseImage.src = Blockly.FieldNumber.NUMPAD_DELETE_ICON;
  eraseButton.appendChild(eraseImage);

  Blockly.bindEvent_(eraseButton, 'mousedown', this,
      this.numPadEraseButtonTouch_);
  contentDiv.appendChild(eraseButton);
};

/**
 * Call for when a num-pad number or punctuation button is touched.
 * Determine what the user is inputting and update the text field appropriately.
 * @param {Event} e The mouse or touch event.
 * @private
 */
Blockly.FieldNumber.prototype.numPadButtonTouch_ = function(e) {
  // String of the button (e.g., '7')
  var spliceValue = e.target.innerText;
  // Old value of the text field
  var oldValue = this.htmlInput_.value;
  // Determine the selected portion of the text field
  var selectionStart = this.htmlInput_.selectionStart;
  var selectionEnd = this.htmlInput_.selectionEnd;

  // Splice in the new value
  var newValue = oldValue.slice(0, selectionStart) + spliceValue +
      oldValue.slice(selectionEnd);

  // Workaround iframe + android issue where it inserts values to the front.
  if (selectionEnd - selectionStart == 0) { // Length of selection == 0
    newValue = oldValue + spliceValue;
  }

  this.numPadUpdateDisplay_(newValue);

  // This is just a click.
  Blockly.Touch.clearTouchIdentifier();

  e.preventDefault();
};

/**
 * Call for when the num-pad erase button is touched.
 * Determine what the user is asking to erase, and erase it.
 * @param {Event} e The mouse or touch event.
 * @private
 */
Blockly.FieldNumber.prototype.numPadEraseButtonTouch_ = function(e) {
  // Old value of the text field
  var oldValue = String(this.getValue());
  // Determine what is selected to erase (if anything)
  var selectionStart = this.htmlInput_.selectionStart;
  var selectionEnd = this.htmlInput_.selectionEnd;
  // Cut out anything that was previously selected
  var newValue = oldValue.slice(0, selectionStart) +
      oldValue.slice(selectionEnd);
  if (selectionEnd - selectionStart == 0) { // Length of selection == 0
    // Delete the last character if nothing was selected
    newValue = selectionEnd == 0 ? oldValue.slice(0, oldValue.length - 1) :
      oldValue.slice(0, selectionStart - 1) + oldValue.slice(selectionStart);
  }
  
  this.numPadUpdateDisplay_(newValue);

  // This is just a click.
  Blockly.Touch.clearTouchIdentifier();

  e.preventDefault();
};


/**
 * Update the displayed value and resize/scroll the text field as needed.
 * @param {string} newValue The new text to display.
 * @private.
 */
Blockly.FieldNumber.prototype.numPadUpdateDisplay_ = function(newValue) {
  // Updates the display. The actual setValue occurs when editing ends.
  this.setEditorValue_(newValue);
  // Resize and scroll the text field appropriately.
  this.resizeEditor_();
  this.htmlInput_.setSelectionRange(newValue.length,
      newValue.length);
  this.htmlInput_.scrollLeft = this.htmlInput_.scrollWidth;
};

Blockly.fieldRegistry.register('field_number', Blockly.FieldNumber);
