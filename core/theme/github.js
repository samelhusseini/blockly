/**
 * @license
 * Copyright 2018 Google LLC
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
 * @fileoverview Github theme.
 */
'use strict';

goog.provide('Blockly.Themes.Github');

goog.require('Blockly.Css');
goog.require('Blockly.Theme');


// Temporary holding object.
Blockly.Themes.Github = {};

Blockly.Themes.Github.defaultBlockStyles = {
  "colour_blocks": {
    "colourPrimary": "#F0DF65"
  },
  "list_blocks": {
    "colourPrimary": "#7048BE"
  },
  "logic_blocks": {
    "colourPrimary": "#1C69D3"
  },
  "loop_blocks": {
    "colourPrimary": "#38BA55"
  },
  "math_blocks": {
    "colourPrimary": "#563F7B"
  },
  "procedure_blocks": {
    "colourPrimary": "290"
  },
  "text_blocks": {
    "colourPrimary": "160"
  },
  "variable_blocks": {
    "colourPrimary": "#F36D25"
  },
  "variable_dynamic_blocks": {
    "colourPrimary": "#F36D25"
  },
  "hat_blocks": {
    "colourPrimary": "330",
    "hat": "cap"
  }
};

Blockly.Themes.Github.categoryStyles = {
  "colour_category": {
    "colour": "#F0DF65"
  },
  "list_category": {
    "colour": "#7048BE"
  },
  "logic_category": {
    "colour": "#1C69D3"
  },
  "loop_category": {
    "colour": "#38BA55"
  },
  "math_category": {
    "colour": "#563F7B"
  },
  "procedure_category": {
    "colour": "290"
  },
  "text_category": {
    "colour": "160"
  },
  "variable_category": {
    "colour": "#F36D25"
  },
  "variable_dynamic_category": {
    "colour": "#F36D25"
  }
};

Blockly.Themes.Github =
    new Blockly.Theme('github', Blockly.Themes.Github.defaultBlockStyles,
        Blockly.Themes.Github.categoryStyles);

Blockly.Themes.Github.setComponentStyle('workspaceBackgroundColour', '#fff');
Blockly.Themes.Github.setComponentStyle('toolboxBackgroundColour', '#fafbfc');
Blockly.Themes.Github.setComponentStyle('toolboxForegroundColour', '#586069');
Blockly.Themes.Github.setComponentStyle('flyoutBackgroundColour', '#F4F6F9');
// Blockly.Themes.Github.setComponentStyle('flyoutForegroundColour', '#ccc');
Blockly.Themes.Github.setComponentStyle('flyoutOpacity', 1);
// Blockly.Themes.Github.setComponentStyle('scrollbarColour', '#797979');
// Blockly.Themes.Github.setComponentStyle('scrollbarOpacity', 0.4);

/**
 * CSS for the Github theme.
 * This registers CSS that is specific to this theme. It does so by prepending a
 * ``.github-theme`` selector before every CSS rule that we wish to override by
 * this theme.
 */
(function() {
  var selector = '.github-theme';
  Blockly.Css.register([
    /* eslint-disable indent */
    // Toolbox
    selector + ' .blocklyToolboxDiv {',
      'box-shadow: 0px 1px 2px 0 rgba(34, 36, 38, 0.15);',
    '}',
    selector + ' .blocklyTreeRow {',
      'border-left-width: 4px !important;',
      'padding: 0.75em 1.25em;',
      'margin-bottom: 0;',
      'border-bottom: 1px solid #eaecef;',
    '}',
    // Toolbox hover
    selector + ' .blocklyTreeRow:not(.blocklyTreeSelected):hover {',
      'background: #F4F6F9;',
    '}',
    // Flyout button
    selector + ' .blocklyFlyoutButton {',
      'fill: #28a745',
    '}',
    selector + ' .blocklyFlyoutButtonShadow {',
      'fill: none;',
    '}',
    selector + ' .blocklyFlyoutButtonBackground {',
      'rx: 2;',
      'ry: 2;',
      'stroke: #319649;',
      'stroke-width: 1px;',
    '}',
    /* eslint-enable indent */
  ]);
})();
