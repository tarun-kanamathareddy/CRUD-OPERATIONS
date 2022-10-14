var entityManager = (function () {
  "use strict";

  var self = this;

  // variables initialised in init() function
  var name_entity, key_entity, fields, field_key, store;
  var container, main_container, submit_button, form_container;
  var crud_key_field, crud_action_field;
  var crud_key_list;
  var title_entity = '';
  var selectedRow = null;

  var messages = {};
  messages.allrequired = 'Please fill in all fields';

  function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  class Model {
      constructor(datas) {
          let keys = Object.keys(datas);
          keys.forEach(key => {
              this[key] = datas[key];
          });
      }
  }

  /**
   * Handles UI tasks
   */
  class UI {

      static displayItems() {
          const items = store.getItems();

          items.forEach((item) => UI.addItemToList(item));
      }

      static addItemToList(item) {

          const row = document.createElement('tr');

          var columns = '';
          fields.forEach(elt => {
              columns += `<td>${item[elt]}</td>`;
          });

          let key = `${item[field_key]}`;

          row.innerHTML = `${columns}
    <td><a href="#" class="btn btn-success btn-sm" data-action="edit" data-id="${key}">Edit</a></td>
    <td><a href="#" class="btn btn-danger btn-sm" data-action="delete" data-id="${key}">Drop</a></td>
  `;
          crud_key_list.appendChild(row);
      }

      static editItemToList(list) {
          fields.forEach((item, index) => {
              selectedRow.children[index].textContent = list[item];
          });
      }

      static deleteItem(el) {
          el.parentElement.parentElement.remove();

          store.removeItem(el.dataset.id);
          UI.showAlert(messages.deleted, 'danger');
      }

      static editItem(el) {
          submit_button.value = 'Submit edition';
          selectedRow = el.parentElement.parentElement;
          fields.forEach((item, index) => {
              form_container.querySelector('[data-field=' + item + ']').value = selectedRow.children[index].textContent;
          });
          let key = el.dataset.id;

          // in edit mode, we protect the field corresponding to the unique key of the model
          let protectField = form_container.querySelector('[data-field=' + field_key + ']');
          if (protectField != undefined) {
              protectField.setAttribute('disabled', 'disabled');
          }

          crud_key_field.value = key;
          crud_action_field.value = 'edit';
      }

      static showAlert(message, className) {
          const div = document.createElement('div');
          div.className = `alert alert-${className}`;

          div.appendChild(document.createTextNode(message));
          const main = main_container.querySelector('.main');
          main_container.insertBefore(div, main);
          // div.style.position = "absolute";
          // div.style.top = "30px";
          // div.style.left = "90%";
          setTimeout(() => main_container.querySelector('.alert').remove(), 3000);
      }

      static clearFields() {
          submit_button.value = 'Submit creation';

          fields.forEach((item, index) => {
              form_container.querySelector('[data-field=' + item + ']').value = '';
          });

          crud_key_field.value = '';
          crud_action_field.value = 'add';

          // in edit mode, we protect the field corresponding to the unique key of the model
          let protectField = form_container.querySelector('[data-field=' + field_key + ']');
          if (protectField != undefined) {
              protectField.removeAttribute('disabled');
          }
      }
  }

  /**
   * Store Class: Handles Storage
   */
  class Store {

      constructor(store_name, field_key) {
          this.store_name = store_name;
          this.field_key = field_key;
      }

      getItems() {
          let items;
          if (localStorage.getItem(this.store_name) === null) {
              items = [];
          } else {
              items = JSON.parse(localStorage.getItem(this.store_name));
          }

          return items;
      }

      addItem(item) {
          let items = store.getItems();
          items.push(item);
          localStorage.setItem(this.store_name, JSON.stringify(items));
      }

      updateItem(key, data) {

          // we delete and recreate the item in the store
          let items = store.getItems();
          for (let index=0, imax=items.length; index<imax; index++) {
              let item = items[index];
              if (item[this.field_key] == key) {
                  items[index] = data;
              }
          }

          localStorage.setItem(this.store_name, JSON.stringify(items));
      }

      removeItem(key) {
          let items = store.getItems();

          items.forEach((item, index) => {
              if (item[this.field_key] === key) {
                  items.splice(index, 1);
              }
          });

          localStorage.setItem(this.store_name, JSON.stringify(items));
      }

      clearStore() {
          localStorage.clear(this.store_name);
      }
  }

  function init(param) {

      title_entity = param.title;
      name_entity = param.entityName;
      key_entity = param.entityKey;
      fields = param.fields;
      field_key = param.fieldKey;

      container = key_entity + '-crud-container';

      messages.deleted = `${name_entity} deleted`;
      messages.added = `${name_entity} added`;
      messages.edited = `${name_entity} edited`;

      //---- FIND THE MAIN CONTAINER
      main_container = document.getElementById(container);
      if (main_container == undefined) {
          console.error('DOM target not found for ID ' + container);
          return;
      }

      //---- SET THE HEADER OF THE TABLE
      let header_key = `[data-id=table-header]`;
      let list_header = main_container.querySelector(header_key);
      if (list_header == undefined) {
          console.error('DOM target not found for ID ' + header_key);
      } else {
          let columns = '';
          fields.forEach(elt => {
              columns += `<th>${capitalize(elt)}</th>`;
          });
          list_header.innerHTML = `<tr>
                  ${columns}
                  <th></th>
                  <th></th>
              </tr>`;
      }

      //---- SET THE TITLE
      let title_key_target = `[data-id=title]`;
      let title_target = main_container.querySelector(title_key_target);
      if (title_target == undefined) {
          console.error('DOM target not found for ID ' + title_key_target);
      } else {
          title_target.innerHTML = title_entity;
      }

      //---- GENERATE THE FORM
      var form_container_key = '[data-id=crud-form]'
      form_container = main_container.querySelector(form_container_key);
      if (form_container == undefined) {
          console.error('DOM target not found for ID ' + form_container_key);
      } else {

          let columns = '';
          fields.forEach(elt => {
              columns += `<div class="form-group">
                  <label class="col-md-12">${capitalize(elt)}
                  <input type="text" data-field="${elt}" class="form-control">
                  </label>
              </div>`;
          });

          form_container.innerHTML = `${columns}
              <input type="hidden" value="" data-id="crud-key">
              <input type="hidden" value="" data-id="crud-action">
              <input type="submit" value="Submit creation" data-id="submit-button" class="btn btn-success btn-block" >
              <input type="button" value="Cancel" data-id="cancel-button" class="btn btn-secondary btn-block" >`;

          form_container.addEventListener('submit', (e) => {
              // Prevent actual submit
              e.preventDefault();

              let form_values = {};
              let flag_all_filled = true;
              fields.forEach((item, index) => {
                  form_values[item] = String(form_container.querySelector('[data-field=' + item + ']').value).trim();
                  if (form_values[item] == '') {
                      flag_all_filled = false;
                  }
              });

              // Validate

              if (flag_all_filled == false) {
                  UI.showAlert(messages.allrequired, 'danger');
              } else {
                  // Instatiate Model
                  const item = new Model(form_values);
                  if (crud_action_field.value == 'add') {
                      console.log('add item');
                      store.addItem(item);
                      // Add item to UI
                      UI.addItemToList(item);
                      selectedRow = null;
                      UI.showAlert(messages.added, 'success');
                  } else {
                      let key = crud_key_field.value;
                      store.updateItem(key, item);
                      UI.editItemToList(item);
                      selectedRow = null;
                      UI.showAlert(messages.edited, 'info');
                  }
                  // Clear fields
                  UI.clearFields();

              }
          });

          // Event: Remove an item
          var crud_dom_key_list = `[data-id=table-list]`;
          crud_key_list = main_container.querySelector(crud_dom_key_list);
          if (crud_key_list == undefined) {
              console.error('DOM target not found for ID ' + crud_dom_key_list);
          } else {
              crud_key_list.addEventListener('click', (e) => {
                  let node = e.target;
                 // if (el.dataset.action)
                  if (node.dataset.action) {
                      if (node.dataset.action == 'delete') {
                          UI.deleteItem(e.target);
                      }
                      if (node.dataset.action == 'edit') {
                          UI.editItem(e.target);
                      }
                  }
              });
          }

          submit_button = main_container.querySelector('[data-id=submit-button]');
          if (submit_button == undefined) {
              console.error('DOM target not found for submit-button');
          }

          let cancel_button = main_container.querySelector('[data-id=cancel-button]');
          if (cancel_button == undefined) {
              console.error('DOM target not found for cancel-button');
          } else {
              cancel_button.addEventListener('click', (e) => {
                  UI.clearFields();
              });
          }

          crud_key_field = main_container.querySelector('[data-id=crud-key]');
          if (crud_key_field == undefined) {
              console.error('DOM target not found for crud-key');
          }
          crud_action_field = main_container.querySelector('[data-id=crud-action]');
          if (crud_action_field == undefined) {
              console.error('DOM target not found for crud-action');
          }

          //---- SET STORE IN LOCAL STORAGE
          store = new Store(param.local_storage_key, field_key);

          if (param.clear_store == true) {
              store.clearStore();
          }

          // Mockup data for starting
          let mockup_data = param.load_mockup || [];
          mockup_data.forEach(item => {
              let book = new Model(item);
              store.addItem(book);
          });

          UI.displayItems();
          UI.clearFields();

          return self;
      }

  }

  // Déclaration des méthodes et propriétés publiques
  return {
      init: init,
  };
})();

  window.addEventListener("DOMContentLoaded", (event) => {
      console.log("DOM entièrement chargé et analysé");

      let mockup = [
          {
              title: 'La Fabrique De L’homme Nouveau. Travailler, Consommer Et Se Taire ?',
              author: 'Jean-Pierre Durand',
              price: '9782'
          },
          {
              title: 'La Dissociété, à la recherche du progrès humain',
              author: 'Jacques Généreux',
              price: '978'
          },
      ];

      let configEntity = {
          clear_store: true,
          local_storage_key: 'books',
          title : 'Book manager',
          entityName : 'Book',
          entityKey : 'book',
          fields : ['title', 'author', 'price'],
          fieldKey : 'price',
          load_mockup: mockup
      };

      let bookmanager = entityManager.init(configEntity);
  });
