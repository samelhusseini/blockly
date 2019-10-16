/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Minimalist rendering drawer.
 */
'use strict';

goog.provide('Blockly.minimalist.Drawer');

goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.utils.object');
goog.require('Blockly.minimalist.RenderInfo');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.minimalist.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
Blockly.minimalist.Drawer = function(block, info) {
  Blockly.minimalist.Drawer.superClass_.constructor.call(this, block, info);
};
Blockly.utils.object.inherits(Blockly.minimalist.Drawer,
    Blockly.blockRendering.Drawer);


/**
 * Draw the block to the workspace. Here "drawing" means setting SVG path
 * elements and moving fields, icons, and connections on the screen.
 *
 * The pieces of the paths are pushed into arrays of "steps", which are then
 * joined with spaces and set directly on the block.  This guarantees that
 * the steps are separated by spaces for improved readability, but isn't
 * required.
 * @package
 */
Blockly.minimalist.Drawer.prototype.draw = function() {
  // Add a foreign element.
  var foreignObject = this.block_.pathObject.foreignObject;
  foreignObject.innerHTML = '';
  this.createDom_(foreignObject);
  // this.hideHiddenIcons_();
  // this.drawOutline_();
  this.drawInternals_();

  // this.block_.pathObject.setPaths(this.outlinePath_ + '\n' + this.inlinePath_);

  // if (this.info_.RTL) {
  //   this.block_.pathObject.flipRTL();
  // }
  if (Blockly.blockRendering.useDebugger) {
    this.block_.renderingDebugger.drawDebug(this.block_, this.info_);
  }
  this.recordSizeOnBlock_();
};

Blockly.minimalist.Drawer.prototype.createDom_ = function(parent) {
  var blockDiv = document.createElement('div');
  blockDiv.className = 'blocklyBlock';
  parent.appendChild(blockDiv);

  var blockColor = this.block_.getColour();
  blockDiv.setAttribute('style',
      'background-color: ' + blockColor + ';' +
      'width: ' + this.info_.widthWithChildren + 'px;' +
      'height: ' + this.info_.height + 'px;');
};

Blockly.minimalist.Drawer.prototype.recordSizeOnBlock_ = function() {
  Blockly.minimalist.Drawer.superClass_.recordSizeOnBlock_.call(this);
  this.block_.pathObject.foreignObject.setAttribute('style',
      'width: ' + this.info_.widthWithChildren + ';' +
      'height: ' + this.info_.height);
};
