/* Allows fields to be selected when clicked */
(function() {
  'use strict';

  var SHIFT_KEY = 16;

  var tableElements = [],
      selectedFields = [],
      holdField = false;

  /* Table deselection */
  var deselectAll = function deselectAll() {
    selectedFields = [];

    for (var i = 0; i < tableElements.length; i += 1)
      deselectTable(tableElements[i]);
  };

  var deselectTable = function deselectTable(tableElement) {
    var selectedElements = tableElement.getElementsByClassName('selected');
    var index;

    for (var i = 0; i < selectedElements.length; i += 1)
      deselectElement(selectedElements[i]);
  };

  var deselectElement = function deselectElement(element) {
    if (element.classList.contains('selected')) {
      element.classList.remove('selected');

      var index = selectedFields.indexOf(element);
      if (index !== -1)
        selectedFields.splice(index, 1);
    } else
      deselect(element);
  };

  /* Field selection */
  var selectField = function selectField(fieldElement) {
    if (!holdField)
      deselectAll();
    else if (fieldElement.classList.contains('selected')) {
      deselectElement(fieldElement);
      selectionChangeEvent.trigger(selectedFields);
      return;
    }

    fieldElement.classList.add('selected');

    if (selectedFields.indexOf(fieldElement) === -1)
      selectedFields.push(fieldElement);

    selectionChangeEvent.trigger(selectedFields);
  }

  /* Click event */
  var fieldOnClick = function fieldOnClick(e) {
    selectField(this);
    e.stopPropagation();
  };

  /* Key-press events */
  var windows = [];
  var windowAttachEvents = function windowAttachEvents(element) {
    var win = element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
    if (windows.indexOf(win) === -1) {
      win.addEventListener('keydown', windowOnKeyDown, false);
      win.addEventListener('keyup', windowOnKeyUp, false);
      windows.push(win);
    }
  };
  var windowOnKeyDown = function windowOnKeyDown(e) {
    holdField = (e.keyCode === SHIFT_KEY) ? true : holdField;
  };
  var windowOnKeyUp = function windowOnKeyUp(e) {
    holdField = (e.keyCode === SHIFT_KEY) ? false : holdField;
  };

  /* Register components */
  var clickSelectTableComponent = new Table.Component('click_select_table', ['table'], {},
    function(tableElement) {
      if (tableElements.indexOf(tableElement) === -1)
        tableElements.push(tableElement);

      windowAttachEvents(tableElement);
  });

  var clickSelectComponent = new Table.Component('click_select', ['field'], {
    'click': fieldOnClick
  });

  /* Add event handling support */
  var selectionChangeEvent = new Table.EventObject('selection-change');

  Table.clickSelect = {
    selectField: selectField,
    deselectAll: deselectAll,
    deselect: deselectElement
  };

  /* Updating support */
  Table.addEventListener('update', function(element) {
    if (Table.util.getElementType(element) === 'table')
      deselectAll();
  });
})();
