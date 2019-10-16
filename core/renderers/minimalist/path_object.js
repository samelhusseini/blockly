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
 * @fileoverview An object that owns a block's rendering SVG elements.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

goog.provide('Blockly.minimalist.PathObject');

goog.require('Blockly.blockRendering.IPathObject');
goog.require('Blockly.utils.dom');

/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 * @param {!SVGElement} root The root SVG element.
 * @constructor
 * @implements {Blockly.blockRendering.IPathObject}
 * @package
 */
Blockly.minimalist.PathObject = function(root) {
  this.svgRoot = root;

  /**
   * The foreign object.
   * @type {SVGForeignObjectElement}
   * @package
   */
  this.foreignObject = Blockly.utils.dom.createSvgElement('foreignObject',
      { }, this.svgRoot);

  /**
   * The primary path of the block.
   * @type {SVGElement}
   * @package
   */
  this.svgPath = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPath'}, this.svgRoot);

  // The light and dark paths need to exist (for now) because there is colouring
  // code in block_svg that depends on them.  But we will always set them to
  // display: none, and eventually we want to remove them entirely.

  /**
   * The light path of the block.
   * @type {SVGElement}
   * @package
   */
  this.svgPathLight = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPathLight'}, this.svgRoot);

  /**
   * The dark path of the block.
   * @type {SVGElement}
   * @package
   */
  this.svgPathDark = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPathDark', 'transform': 'translate(1,1)'},
      this.svgRoot);
};
