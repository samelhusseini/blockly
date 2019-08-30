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
 * @fileoverview Workspace search.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.Search');

goog.require('Blockly.utils.KeyCodes');

/**
 * Class for a Workspace search.
 * @param {!Blockly.Workspace} workspace The workspace in which to add the search.
 * @constructor
 * @package
 */
Blockly.Search = function(workspace) {
  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * Is RTL vs LTR.
   * @type {boolean}
   */
  this.RTL = workspace.options.RTL;

  /**
   * Is the search box visible.
   * @type {boolean}
   * @private
   */
  this.visible_ = false;

  /**
   * Search box input element.
   * @type {HTMLInputElement}
   * @private
   */
  this.htmlInput_ = null;

  /**
   * Search box close button.
   * @type {HTMLButtonElement}
   * @private
   */
  this.closeButton_ = null;


  this.searchResults_ = [];

  this.highlightedBlock_ = null;
};

/**
 * Initializes the search box.
 * @package
 */
Blockly.Search.prototype.init = function() {
  var workspace = this.workspace_;
  var svg = this.workspace_.getParentSvg();

  this.htmlDiv = document.createElement('div');
  this.htmlDiv.className = 'blocklySearchDiv';
  this.htmlDiv.setAttribute('dir', workspace.RTL ? 'RTL' : 'LTR');
  svg.parentNode.insertBefore(this.htmlDiv, svg);
  
  var inputBox = this.createInput_();
  this.htmlDiv.appendChild(inputBox);

  this.closeButton_ = this.createCloseButton_();
  this.htmlDiv.appendChild(this.closeButton_);

  this.bindEvents_();

};

/**
 * Show the search box and focus the input element.
 * @package
 */
Blockly.Search.prototype.show = function() {
  this.setVisible_(true);
  // Focus the search box.
  this.htmlInput_.focus();
  // Select the search box.
  this.htmlInput_.select();
};

/**
 * Hide the search box.
 * @package
 */
Blockly.Search.prototype.hide = function() {
  this.setVisible_(false);
  // Clear the search input.
  this.htmlInput_.value = '';
  this.search_();

  // Blur the search box.
  this.htmlInput_.blur();
};

/**
 * Sets whether this search box is visible or not.
 * @param {boolean} visible True if visible.
 * @private
 */
Blockly.Search.prototype.setVisible_ = function(visible) {
  if (this.visible_ === visible) {
    return;
  }
  if (visible) {
    Blockly.utils.dom.addClass(this.htmlDiv, 'visible');
  } else {
    Blockly.utils.dom.removeClass(this.htmlDiv, 'visible');
  }
  this.visible_ = visible;
};

/**
 * 
 */
Blockly.Search.prototype.position = function() {

};


/**
 * Creates the search box input.
 * @returns {!HTMLInputElement} Search input element.
 * @private
 */
Blockly.Search.prototype.createInput_ = function() {
  var wrapper = document.createElement('div');
  this.inputWrapper_ = wrapper;
  wrapper.className = 'blocklySearchInputWrapper';

  var table = document.createElement('table');
  wrapper.appendChild(table);

  var row = document.createElement('tr');
  table.appendChild(row);

  var inputCol = document.createElement('td');
  row.appendChild(inputCol);

  var input = /** @type {!HTMLInputEleement} */ (document.createElement('input'));
  this.htmlInput_ = input;
  inputCol.appendChild(input);

  input.className = 'blocklySearchInput';

  input.setAttribute('placeholder', 'Search in Workspace'); // Localize


  var countCol = document.createElement('td');
  row.appendChild(countCol);

  this.countSpan_ = document.createElement('span');
  this.countSpan_.className = 'blocklySearchInputCount';
  countCol.appendChild(this.countSpan_);

  return wrapper;
};


/**
 * Creates the search box input.
 * @returns {!HTMLInputElement} Search input element.
 * @private
 */
Blockly.Search.prototype.createNextPrev_ = function() {
  var wrapper = document.createElement('div');



  return wrapper;
};

/**
 * Creates the search box input.
 * @returns {!HTMLInputElement} Search input element.
 * @private
 */
Blockly.Search.prototype.createCloseButton_ = function() {
  var button = document.createElement('button');
  button.className = 'blocklySearchClose';
  

  var closeIcon = document.createElement('span');
  closeIcon.className = 'blocklyClose';
  closeIcon.textContent = 'x';
  button.appendChild(closeIcon);

  return button;
};


/**
 * Bind handlers for user input.
 * @private
 */
Blockly.Search.prototype.bindEvents_ = function() {
  // Trap Enter without IME and Esc to hide.
  this.onKeyDownWrapper_ =
      Blockly.bindEventWithChecks_(
          this.htmlInput_, 'keydown', this, this.onHtmlInputKeyDown_);
  // Search on every input.
  this.onKeyInputWrapper_ =
      Blockly.bindEventWithChecks_(
          this.htmlInput_, 'input', this, this.search_);
  // Focus / Blur.
  this.onFocusInputWrapper_ =
      Blockly.bindEventWithChecks_(
          this.htmlInput_, 'focus', this, this.onFocusInput_);
  this.onBlurInputWrapper_ =
      Blockly.bindEventWithChecks_(
          this.htmlInput_, 'blur', this, this.onBlurInput_);
  this.onInputClickWrapper_ =
      Blockly.bindEventWithChecks_(
          this.inputWrapper_, 'click', this, this.onInputClicked_);
  // Hide when the close button is clicked.
  this.closeButtonWrapper_ =
      Blockly.bindEventWithChecks_(
          this.closeButton_, 'click', this, this.hide);
};

/**
 * Unbind handlers for user input and workspace size changes.
 * @private
 */
Blockly.Search.prototype.unbindInputEvents_ = function() {
  Blockly.unbindEvent_(this.onKeyDownWrapper_);
  Blockly.unbindEvent_(this.onKeyInputWrapper_);
  Blockly.unbindEvent_(this.onFocusInputWrapper_);
  Blockly.unbindEvent_(this.onBlurInputWrapper_);
  Blockly.unbindEvent_(this.onInputClickWrapper_);
  Blockly.unbindEvent_(this.closeButtonWrapper_);
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.Search.prototype.onHtmlInputKeyDown_ = function(e) {
  if (e.keyCode == Blockly.utils.KeyCodes.ESC) {
    this.hide();
  } else if (e.keyCode == Blockly.utils.KeyCodes.F && (e.ctrlKey || e.metaKey)) {
    this.show();
    e.preventDefault();
  } else if (e.keyCode == Blockly.utils.KeyCodes.ENTER) {
    this.highlightNext_();
  }
};

/**
 * Handle when the search box is focused.
 * @private
 */
Blockly.Search.prototype.onFocusInput_ = function() {
  Blockly.utils.dom.addClass(this.inputWrapper_, 'focused');
  // Run search again in case anything has changed.
  this.search_();
};

/**
 * Handle when the search box is blurred.
 * @private
 */
Blockly.Search.prototype.onBlurInput_ = function() {
  Blockly.utils.dom.removeClass(this.inputWrapper_, 'focused');
};

/**
 * Handle when the search box is blurred.
 * @private
 */
Blockly.Search.prototype.onInputClicked_ = function() {
  this.show();
};


/**
 * Trigger a search.
 * @private
 */
Blockly.Search.prototype.search_ = function() {
  var searchText = this.htmlInput_.value;
  this.search(searchText);
};

/**
 * Built-in workspace search algorithm.
 * @param {string} search Search term.
 * @returns {Array.<Blockly.BlockSvg>} Search results, list of blocks that
 *   match the search term provided.
 */
Blockly.Search.prototype.search = function(search) {
  console.log('searching: ', search);
  if (this.highlightedBlock_) {
    // Clear the currently highlighted block.
    this.highlightedBlock_.setHighlighted(false);
    this.highlightedBlock_ = null;
  }
  var results = [];

  if (!search) {
    this.setResultCount_(0, 0);
    return;
  }
  // Search all blocks.
  var blocks = this.workspace_.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (this.searchBlock_(block, search)) {
      results.push(block);
    }
  }

  this.searchResults_ = results;

  // Go through the matches and highlight them
  // Highlight the first match.
  this.higlightSearchIndex_(0);
  return results;
};


Blockly.Search.prototype.highlightNext_ = function() {
  var length = this.searchResults_.length;
  if (length) {
    // Highlight the next item.
    var currentIndex = this.highlightedIndex_;
    var nextIndex = (currentIndex + 1) % length;
    console.log('next', nextIndex);
    this.higlightSearchIndex_(nextIndex);
  }
};

Blockly.Search.prototype.higlightSearchIndex_ = function(index) {
  if (this.highlightedBlock_) {
    // Clear the currently highlighted block.
    this.highlightedBlock_.setHighlighted(false);
  }

  var block = this.searchResults_[index];
  block.setHighlighted(true);

  this.highlightedBlock_ = block;
  this.highlightedIndex_ = index;

  this.setResultCount_(index + 1, this.searchResults_.length);
};

Blockly.Search.prototype.setResultCount_ = function(current, total) {
  if (total) {
    this.countSpan_.textContent = current + ' of ' + total;
  } else {
    this.countSpan_.textContent = '';
  }
};

/**
 * Search whether this block matches the search term.
 * @param {!Blockly.BlockSvg} block Block to test.
 * @param {string} search Search term.
 * @returns {boolean} Whether or not the block is a match.
 * @private
 */
Blockly.Search.prototype.searchBlock_ = function(block, search) {
  var blockStr = block.toString();
  console.log(blockStr, search);
  if (blockStr.indexOf(search) > -1) {
    return true;
  }
  return false;
};
