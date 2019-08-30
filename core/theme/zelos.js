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
 * @fileoverview Zelos theme.
 */
'use strict';

goog.provide('Blockly.Themes.Zelos');

goog.require('Blockly.Theme');


// Temporary holding object.
Blockly.Themes.Zelos = {};

Blockly.Themes.Zelos.defaultBlockStyles = {
  "colour_blocks": {
    "colourPrimary": "#CF63CF",
    "colourSecondary": "#C94FC9",
    "colourTertiary": "#BD42BD"
  },
  "list_blocks": {
    "colourPrimary": "#9966FF",
    "colourSecondary": "#855CD6",
    "colourTertiary": "#774DCB"
  },
  "logic_blocks": {
    "colourPrimary": "#4C97FF",
    "colourSecondary": "#4280D7",
    "colourTertiary": "#3373CC"
  },
  "loop_blocks": {
    "colourPrimary": "#FFAB19",
    "colourSecondary": "#EC9C13",
    "colourTertiary": "#CF8B17"
  },
  "math_blocks": {
    "colourPrimary": "#59C059",
    "colourSecondary": "#46B946",
    "colourTertiary": "#389438"
  },
  "procedure_blocks": {
    "colourPrimary": "#FF6680",
    "colourSecondary": "#FF4D6A",
    "colourTertiary": "#FF3355"
  },
  "text_blocks": {
    "colourPrimary": "#0fBD8C",
    "colourSecondary": "#0DA57A",
    "colourTertiary": "#0B8E69"
  },
  "variable_blocks": {
    "colourPrimary": "#FF8C1A",
    "colourSecondary": "#FF8000",
    "colourTertiary": "#DB6E00"
  },
  "variable_dynamic_blocks": {
    "colourPrimary": "#FF8C1A",
    "colourSecondary": "#FF8000",
    "colourTertiary": "#DB6E00"
  },
  "hat_blocks": {
    "colourPrimary": "#FFBF00",
    "colourSecondary": "#E6AC00",
    "colourTertiary": "#CC9900",
    "hat": "cap"
  }
};

Blockly.Themes.Zelos.categoryStyles = {
  "colour_category": {
    "colour": "#CF63CF"
  },
  "list_category": {
    "colour": "#9966FF"
  },
  "logic_category": {
    "colour": "#4C97FF"
  },
  "loop_category": {
    "colour": "#FFAB19"
  },
  "math_category": {
    "colour": "#59C059"
  },
  "procedure_category": {
    "colour": "#FF6680"
  },
  "text_category": {
    "colour": "#0fBD8C"
  },
  "variable_category": {
    "colour": "#FF8C1A"
  },
  "variable_dynamic_category": {
    "colour": "#FF8C1A"
  }
};

// This style is still being fleshed out and may change.
Blockly.Themes.Zelos =
    new Blockly.Theme(Blockly.Themes.Zelos.defaultBlockStyles,
        Blockly.Themes.Zelos.categoryStyles);

Blockly.Themes.Zelos.rendering = 'zelos';
