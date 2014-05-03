/* Allows fields to be selected when clicked */
(function() {
  'use strict';

  var tableElements = [],
      selectedField = null;

  /* Field selection/deselection */
  var selectField = function selectField(fieldElement) {
    deselectField();

    fieldElement.classList.add('selected');
    selectedField = fieldElement;

    selectionChangeEvent.trigger(selectedField);
  }

  var deselectField = function deselectField() {
    if (selectedField !== null) {
      selectedField.classList.remove('selected');
      selectedField = null;
    }
  };

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
    deselect: deselectField
  };

  /* Updating support */
  Table.addEventListener('update', function(element) {
    if (Table.util.getElementType(element) === 'table')
      deselect();
  });
})();
