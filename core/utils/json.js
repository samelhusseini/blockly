/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview XML element manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.utils.json
 * @namespace
 */
goog.provide('Blockly.utils.json');


/**
 * Create DOM element for XML.
 * @param {string} tagName Name of DOM element.
 * @return {!Element} New DOM element.
 * @public
 */
Blockly.utils.xml.createElement = function(tagName) {
  return new Blockly.utils.json.object(tagName);
};

/**
 * Create text element for XML.
 * @param {string} text Text content.
 * @return {!Node} New DOM node.
 * @public
 */
Blockly.utils.xml.createTextNode = function(text) {
  return text;
};

/**
 * Converts an XML string into a DOM tree. This method will be overridden in
 * the Node.js build of Blockly. See gulpfile.js, blockly_javascript_en task.
 * @param {string} text XML string.
 * @return {Document} The DOM document.
 * @throws if XML doesn't parse.
 * @public
 */
Blockly.utils.xml.textToDomDocument = function(text) {
  var doc = JSON.parse(text, function(key, val) {
    // if this is an object, and is CardboardBox
    if (typeof(val) === 'object' &&
        val.__type === 'b') {
      var obj = new Blockly.utils.json.object(val.tagName);
      var keys = Object.keys(val);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key == 'childNodes') {
          for (var c = 0; c < val.childNodes.length; c++) {
            obj.appendChild(val.childNodes[c]);
          }
        } else {
          obj[key] = val[key];
        }
      }
      return obj;
    }

    return val;
  });
  return {
    documentElement: doc,
    getElementsByTagName: function() {return [];}
  };
};

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 * @public
 */
Blockly.utils.xml.domToText = function(dom) {
  return JSON.stringify(dom);
};



Blockly.utils.json.object = function(tagName) {
  /**
   * 
   * @private
   */
  this.tagName = tagName;

  this.nodeName = tagName;
  
  this.childNodes = [];

  this.__type = 'b';
};

Blockly.utils.json.object.prototype.hasChildNodes = function() {
  return this.childNodes.length;
};

Blockly.utils.json.object.prototype.appendChild = function(child) {
  this.childNodes.push(child);
};

Blockly.utils.json.object.prototype.setAttribute = function(name, value) {
  this[name] = value;
};

Blockly.utils.json.object.prototype.getAttribute = function(name) {
  return this[name];
};

Blockly.utils.json.object.prototype.hasAttribute = function(name) {
  return !!this[name];
};

Blockly.utils.json.object.prototype.getId = function() {
  return this['id'];
};

