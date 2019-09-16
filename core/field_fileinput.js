/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview File input field.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.FieldFileInput');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.userAgent');


/**
 * Class for a file input field.
 * @param {string=} opt_value The initial content of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/checkbox#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldFileInput = function(opt_value, opt_validator, opt_config) {

  /**
   * Specifies what file types the user can pick from the file input dialog.
   */
  this.accept_ = null;

  if (opt_value === null) {
    opt_value = '';
  }
  Blockly.FieldFileInput.superClass_.constructor.call(this,
      opt_value, opt_validator, opt_config);
};
Blockly.utils.object.inherits(Blockly.FieldFileInput,
    Blockly.FieldTextInput);

/**
 * Construct a FieldFileInput from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @return {!Blockly.FieldFileInput} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldFileInput.fromJson = function(options) {
  return new Blockly.FieldFileInput(options['file'], undefined, options);
};

/**
 * Configure the field based on the given map of options.
 * @param {!Object} config A map of options to configure the field based on.
 * @private
 */
Blockly.FieldFileInput.prototype.configure_ = function(config) {
  Blockly.FieldFileInput.superClass_.configure_.call(this, config);
  if (config['accept']) {
    this.accept_ = config['accept'];
  }
};

/**
 * Create the text input editor widget.
 * @return {!HTMLInputElement} The newly created text input editor.
 * @protected
 */
Blockly.FieldFileInput.prototype.widgetCreate_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  div.style.display = 'none';

  var htmlInput = /** @type {!HTMLInputElement} */ (document.createElement('input'));
  htmlInput.setAttribute('type', 'file');
  if (this.accept_) {
    htmlInput.setAttribute('accept', this.accept_);
  }
  div.appendChild(htmlInput);

  htmlInput.value = '';
  htmlInput.untypedDefaultValue_ = this.value_;
  htmlInput.oldValue_ = null;

  this.bindInputEvents_(htmlInput);

  htmlInput.click();

  return htmlInput;
};

/**
 * Bind handlers for user input on the text input field's editor.
 * @param {!HTMLElement} htmlInput The htmlInput to which event
 *    handlers will be bound.
 * @protected
 * @override
 */
Blockly.FieldFileInput.prototype.bindInputEvents_ = function(htmlInput) {
  this.onKeyInputWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'input', this, this.onHtmlInputChange_);
};

/**
 * Unbind handlers for user input and workspace size changes.
 * @protected
 * @override
 */
Blockly.FieldFileInput.prototype.unbindInputEvents_ = function() {
  Blockly.unbindEvent_(this.onKeyInputWrapper_);
};

Blockly.fieldRegistry.register('field_fileinput', Blockly.FieldFileInput);
