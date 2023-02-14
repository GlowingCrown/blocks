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
 * @fileoverview Polygon block.
 * @author @RedMan13 (godslayerakp)
 */
'use strict';

goog.provide('Blockly.Blocks.ploygon');
goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');

// the arrow svg's have to be accessed when the image is suposed to be rendered
// becuase mainWorkspace isnt initialized when these get defined
const arrowLeft = () => Blockly.mainWorkspace.options.pathToMedia + 'polygon-colapse.svg'
const arrowRight = () => Blockly.mainWorkspace.options.pathToMedia + 'polygon-expand.svg'
const buttonClick = (field) => {
  const thisBlock = field.sourceBlock_
  const newState = !thisBlock.isCollapsed()
  thisBlock.setCollapsed(newState)
  return newState 
    ? arrowLeft() 
    : arrowRight()
}

Blockly.Blocks['polygon'] = {
  /**
   * Block for complex shapes.
   * @this Blockly.Block
   */
  init: function() {
    this.color = Blockly.Colours.textField
    this.points = 0
    this.oldConnections = {}
    this.generate()
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');

    container.setAttribute('points', this.points);
    return container;
  },
  domToMutation: function(xmlElement) {
    const newPoints = JSON.parse(xmlElement.getAttribute('points'))
    const newColor = JSON.parse(xmlElement.getAttribute('color') || '""')
    if (newPoints === this.points) {
      this.clear()
      this.points = newPoints
      this.generate()
    }
    if (newColor) {
      this.color = newColor
    }
  },
  clear: function() {
    const connections = {}
    for (let point = 1; point <= this.points; point++) {
      const xName = `x${point}`
      const yName = `y${point}`
      const xInput = this.getInput(xName)
      const yInput = this.getInput(yName)
      connections[xName] = xInput.connection.targetConnection
      connections[yName] = yInput.connection.targetConnection
      xInput.dispose()
      yInput.dispose()
    }

    const button = this.getInput('button')
    button.dispose()
    this.oldConnections = connections
  },
  generate: function() {
    const connections = this.oldConnections
    // create all the node inputs
    for (let point = 1; point <= this.points; point++) {
      const xName = `x${point}`
      const yName = `y${point}`
      const xInput = this.appendValueInput(xName)
      const yInput = this.appendValueInput(yName)
      const xConnection = xInput.connection
      const yConnection = yInput.connection
      if (!(connections[xName] || connections[yName])) {
        const newxBlock = this.workspace.newBlock('math_number');
        const newyBlock = this.workspace.newBlock('math_number');
        newxBlock.setFieldValue('1', 'NUM');
        newyBlock.setFieldValue('1', 'NUM');
        newxBlock.setShadow(true);
        newyBlock.setShadow(true);
        newxBlock.initSvg();
        newyBlock.initSvg();
        newxBlock.render(false);
        newyBlock.render(false);
        connections[xName] = newxBlock.outputConnection
        connections[yName] = newyBlock.outputConnection
      }
      connections[yName].connect(xConnection)
      connections[yName].connect(yConnection)
      xInput.appendField('x:')
      yInput.appendField('y:')
    }

    this.setColour(this.color, this.color, this.color)
    this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE)
    this.setOutput(true, 'math_polygon')
    this.setShadow(true);
    const button = new Blockly.FieldImage(
      this.isCollapsed() 
        ? arrowLeft() 
        : arrowRight(), 
      100, 
      100, 
      null, 
      false, 
      buttonClick
    )
    this.appendDummyInput('button')
      .appendField(button)
  }
};
