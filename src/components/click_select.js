/* Allows fields to be selected when clicked */
(function() {
  'use strict';

  var tableElements = [],
      selectedField = null;

  /* Table deselection */
  var deselectAll = function deselectAll() {
    for (var i = 0; i < tableElements.length; i += 1)
      deselectTable(tableElements[i]);
  };

  var deselectTable = function deselectTable(tableElement) {
    var selectedElements = tableElement.getElementsByClassName('selected');
    if (selectedElements.length === 1)
      selectedElements[0].classList.remove('selected');
  };

  var deselectElement = function deselectElement(element) {
    if (element.classList.contains('selected'))
      element.classList.remove('selected');
    else
      deselect(element);
  };

  /* Field selection */
  var selectField = function selectField(fieldElement) {
    if (fieldElement === selectedField)
      return;

    deselectAll();

    fieldElement.classList.add('selected');
    selectedField = fieldElement;
    selectionChangeEvent.trigger(this);
  }

  /* Click event */
  var fieldOnClick = function fieldOnClick(e) {
    selectField(this);
    e.stopPropagation();
  };

  /* Register components */
  var clickSelectTableComponent = new Table.Component('click_select_table', ['table'], {},
    function(tableElement) {
      if (tableElements.indexOf(tableElement) === -1)
        tableElements.push(tableElement);
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
