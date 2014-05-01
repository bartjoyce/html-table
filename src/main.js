var Table = {};

(function() {
  'use strict';

  /* Element registration */
  Table.load = function load(win) {
    var doc = win.document;

    var tableElements = doc.getElementsByClassName('table');

    for (var i = 0; i < tableElements.length; i += 1)
      if (tableElements[i].tagName === 'TABLE')
        Table.registerTable(tableElements[i]);
  };

  Table.registerElement = function registerTable(element) {
    if (!Table.util.isElement(element)) {
      for (var i = 0; i < element.children.length; i += 1)
        Table.registerElement(element.children[i]);

    } else {
      for (var i = 0; i < element.children.length; i += 1)
        Table.registerElement(element.children[i]);

      var componentNames = Table.util.getComponentsForElement(element);
      for (var i = 0; i < componentNames.length; i += 1) {
        var componentName = componentNames[i];
        Table.attachComponent(element, componentName);
      }
    }
  };

  Table.updateElement = function(element, stopBubbling) {
    updateEvent.trigger(element);

    if (!Table.util.isElement(element)) {
      for (var i = 0; i < element.children.length; i += 1)
        Table.updateElement(element.children[i], true);

    } else {
      for (var i = 0; i < element.children.length; i += 1)
        Table.updateElement(element.children[i], true);

      var componentNames = Table.util.getElementComponents(element);
      for (var i = 0; i < componentNames.length; i += 1) {
        var componentName = componentNames[i];
        Table.attachComponent(element, componentName);
      }
    }

    if (stopBubbling)
      return;

    element = element.parentElement;
    while (element !== null && !element.classList.contains('code')) {
      updateEvent.trigger(element);
      element = element.parentElement;
    }

    if (element !== null)
      updateEvent.trigger(element);
  };

  Table.attachComponent = function(element, componentName) {
    if (!element.hasAttribute('data-components'))
      element.setAttribute('data-components', componentName);
    else {
      var componentNames = element.getAttribute('data-components').split(' ');
      if (componentNames.indexOf(componentName) === -1) {
        componentNames.push(componentName);
        element.setAttribute('data-components', componentNames.join(' '));
      }
    }

    var component = Table.components[componentName];

    var events = Object.keys(component.events);

    for (var i = 0; i < events.length; i += 1) {
      var eventName = events[i];
      element.removeEventListener(eventName, component.events[eventName], false);
      element.addEventListener(eventName, component.events[eventName], false);
    }

    if (typeof component.initialise === 'function')
      component.initialise(element);
  };

  Table.detachComponent = function(element, componentName) {
    if (!element.hasAttribute('data-components'))
      return;
    else {
      var componentNames = element.getAttribute('data-components').split(' ');

      var i = componentNames.indexOf(componentName);
      if (i === -1)
        return;

      componentNames.splice(i, 1);
      element.setAttribute('data-components', componentNames.join(' '));
    }

    var component = Table.components[componentName];

    var events = Object.keys(component.events);

    for (var i = 0; i < events.length; i += 1) {
      var eventName = events[i];
      element.removeEventListener(eventName, component.events[eventName], false);
    }
  };

  /* Types */
  var types = [];
  var supportedTagNames = [];

  Table.Type = function Type(name, tagName, groups) {
    this.name = name;
    this.tagName = tagName.toString().toUpperCase();
    this.groups = (typeof groups === 'string') ? [groups] : groups || [];

    types.push(this);

    if (supportedTagNames.indexOf(this.tagName) === -1)
      supportedTagNames.push(this.tagName);

    return this;
  };

  new Table.Type('table', 'table');

  new Table.Type('row', 'tr');

  new Table.Type('normal', 'td', 'field');
  new Table.Type('heading', 'th', 'field');

  /* Utility Functions */
  Table.util = {
    expandType: function(type) {
      var types = [];

      for (var i = 0; i < Table.types.length; i += 1) {
        if (Table.types[i].name === type)
          return [type];

        if (Table.types[i].groups.indexOf(type) !== -1)
          types.push(Table.types[i].name);
      }

      return types;
    },
    expandTypes: function(types) {
      var expandedTypes = [];

      for (var i = 0; i < types.length; i += 1)
        expandedTypes = expandedTypes.concat(Table.util.expandType(types[i]));

      return expandedTypes;
    },
    getTypeInformation: function(type) {
      for (var i = 0; i < types.length; i += 1)
        if (types[i].name === type)
          return types[i];

      return null;
    },
    isElement: function(element) {
      if (supportedTagNames.indexOf(element.tagName) === -1)
        return false;

      return (Table.util.getElementType(element) !== undefined);
    },
    getElementType: function(element) {
      for (var i = 0; i < types.length; i += 1)
        if (element.tagName === types[i].tagName && element.classList.contains(types[i].name))
          return types[i].name;
    },
    getComponentsForType: function(type) {
      var components = [];
      var componentNames = Object.keys(Table.components);

      for (var i = 0; i < componentNames.length; i += 1) {
        var componentName = componentNames[i];
        var component = Table.components[componentName];
        var componentTargets = Table.util.expandTypes(component.targets);
        if (componentTargets.indexOf(type) !== -1)
          components.push(componentName);
      }

      return components;
    },
    getComponentsForElement: function(element) {
      return Table.util.getComponentsForType(Table.util.getElementType(element));
    },
    getElementComponents: function(element) {
      return element.hasAttribute('data-components') ? element.getAttribute('data-components').split(' ') : [];
    }
  };

  /* Components */
  Table.components = {};

  Table.Component = function Component(name, targets, events, initialise) {
    this.name = name || 'untitled';
    this.targets = targets;
    this.events = events;
    this.initialise = initialise;

    Table.components[name] = this;

    return this;
  };

  /* Event system */
  Table.events = {};

  Table.addEventListener = function addEventListener(name, callback) {
    if (Table.events[name] === undefined || typeof callback !== 'function')
      return;

    Table.events[name].eventListeners.push(callback);
  };
  Table.removeEventListener = function removeEventListener(name, callback) {
    if (Table.events[name] === undefined || typeof callback !== 'function')
      return;

    var i = Table.events[name].eventListeners.indexOf(callback);
    if (i !== -1)
      Table.events[name].eventListeners.splice(i, 1);
  };

  Table.EventObject = function EventObject(name) {
    this.name = name;
    this.eventListeners = [];
    this.trigger = function() {
      for (var i = 0; i < this.eventListeners.length; i += 1)
        this.eventListeners[i].apply(this, arguments);
    };

    Table.events[name] = this;

    return this;
  };

  /* Element updating system */
  var updateEvent = new Table.EventObject('update');
})();
