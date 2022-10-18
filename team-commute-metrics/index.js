class Model {
    constructor() {
        this.todos = []
    }
    
    addTodo(todoText, todoDaysCommuting, commuteInSeconds) {
      
        const todo = {
          id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
          text: todoText,
          complete: false,
          daysCommuting: todoDaysCommuting,
          //commute for a day in minutes
          commuteInSeconds: (commuteInSeconds / 60),
          //commute for a week in hours
          //multiply by number of days commuting, divide by 60 to get seconds to minutes, divide by 60 to get minutes to hours
          commuteWeek: ((commuteInSeconds * todoDaysCommuting) / 60)/60,
          //commute for a month in hours
          //multiply Week by 4 for a full month
          commuteMonth: (((commuteInSeconds * todoDaysCommuting) / 60)/60) * 4,
          //commute for a year in days
          // multiply month by 12 for full year, divide by 24 for days
          commuteYear: (((((commuteInSeconds * todoDaysCommuting) / 60)/60) * 4) * 12)/ 24
        }
    
        this.todos.push(todo)
        
        this.onTodoListChanged(this.todos)
        
    }
    
    // Map through all todos, and replace the text of the todo with the specified id
    editTodo(id, updatedDaysCommuting) {
      this.todos = this.todos.map((todo) =>
        todo.id === id ? {
          id: todo.id, 
          text: todo.text, 
          complete: todo.complete, 
          daysCommuting: updatedDaysCommuting,
          commuteInSeconds: todo.commuteInSeconds,
          commuteWeek: ((todo.commuteInSeconds * updatedDaysCommuting))/60,
          commuteMonth: (((todo.commuteInSeconds * updatedDaysCommuting))/60) * 4,
          commuteYear: (((((todo.commuteInSeconds * updatedDaysCommuting))/60) * 4) * 12)/ 24
        } 
          : todo,
      )
      this.onTodoListChanged(this.todos)
    
    }
  
    // Filter a todo out of the array by id
    deleteTodo(id) {
      this.todos = this.todos.filter((todo) => todo.id !== id)
      this.onTodoListChanged(this.todos)
    }

    // Flip the complete boolean on the specified todo
    toggleTodo(id) {
      this.todos = this.todos.map((todo) =>
        todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo,
      )
      this.onTodoListChanged(this.todos)
    }
  
    bindTodoListChanged(callback) {
      this.onTodoListChanged = callback
    }

    //11001 Euclid Ave, Cleveland, OH 44106
    //5001 Rockside Rd 1st Fl, Independence, OH 44131
    //302 E Buchtel Ave, Akron, OH 44325
    //4565 Crestview Ct, Cleveland, OH 44143
    //start of API code
    initMap(todoText, todoDaysCommuting, todoWorkplace) {
      const directionsService = new google.maps.DirectionsService();
      this.calculateRouteDuration(directionsService, todoText, todoDaysCommuting, todoWorkplace);
    }
    
    calculateRouteDuration(directionsService, todoText, todoDaysCommuting, todoWorkplace) {
      
      var commuteInSeconds

      directionsService
        .route({
          origin: {
            query: todoText,
          },
          destination: {
            query: todoWorkplace,
          },
          travelMode: google.maps.TravelMode.DRIVING,
        })
        .then((response) => {
          //number of seconds from A to B
          //multiplied by 2 to get time for commute in a day (both ways)
          commuteInSeconds = (response.routes[0].legs[0].duration.value) * 2
          console.log(commuteInSeconds);
          this.addTodo(todoText, todoDaysCommuting, commuteInSeconds)
        })
      
    }
    //end of API code

}//end Model

class View {
  constructor() {
  // elements that won't change

  // The root element
  this.app = this.getElement('#root')

  // The title of the app
  this.title = this.createElement('h1')
  this.title.textContent = 'Team Commute Metrics'

  // The workplace form, with a [type="text"] input
  this.workplaceAddressForm = this.createElement('form')

  this.workplaceAddressInput = this.createElement('input')
  this.workplaceAddressInput.type = 'text'
  this.workplaceAddressInput.placeholder = 'Add Workplace Address'
  this.workplaceAddressInput.name = 'workplaceAddress'

  // The TeamMemberAddressForm, with a [type="text"] input, and a submit button to add team member address to array
  this.TeamMemberAddressForm = this.createElement('form')

  this.input = this.createElement('input')
  this.input.type = 'text'
  this.input.placeholder = 'Add Employee Address'
  this.input.name = 'todo'

  //Create array of options to be added to selectList
  var arrayList = [1, 2, 3, 4, 5, 6, 7];
  //Create and append select list for days commuting
  this.selectList = this.createElement("select");
  this.selectList.setAttribute("id", "daysCommmuting");
  //Create and append the options
  for (var i = 0; i < arrayList.length; i++) {
      var option = document.createElement("option");
      option.setAttribute("value", arrayList[i]);
      option.text = arrayList[i];
      this.selectList.appendChild(option);
  }

  //button form, row will all the buttons
  this.ButtonForm = this.createElement('form')
  //button to submit entry into array
  this.submitButton = this.createElement('button')
  this.submitButton.textContent = 'Submit'
  //button to calculate commute metrics
  this.calculateButton = this.createElement('button')
  this.calculateButton.textContent = 'Calculate'

  // The visual representation of the todo list
  this.todoList = this.createElement('ul', 'todo-list')

  // Append the input to the workplaceAddressForm
  this.workplaceAddressForm.append(this.workplaceAddressInput)

  // Append the input and selectList to the TeamMemberAddressForm
  this.TeamMemberAddressForm.append(this.input, this.selectList)

  // Append the submit button, and calculate button to the ButtonForm
  this.ButtonForm.append(this.submitButton, this.calculateButton)

  // The visual representation of the aggregate list
  this.aggregateList = this.createElement('ul', 'aggregate-list')

  this.app.append(this.title, this.workplaceAddressForm, this.TeamMemberAddressForm, this.ButtonForm, this.aggregateList, this.todoList)

  this._temporaryTodoEmployeeDaysCommuting
  this._initLocalListeners()
  
  }//end contructor for View

  //start displayTodos
  displayTodos(todos) {
    // Delete all nodes from the todoList unlisted list element
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild)
    }

    //Delete all nodes from aggregateList
    while (this.aggregateList.firstChild) {
      this.aggregateList.removeChild(this.aggregateList.firstChild)
    }
    
    //if there are no elements in todo[] list, display message
    //else, create an li element to append to the todoList element for each item in todo[] list
    // Show default message
    if (todos.length === 0) {
      const p = this.createElement('p')
      p.textContent = 
      'In the first input add the workplace address. ' +
      'In the second input add the employee\'s address and the use the dropdown to indicate how many days the employee commutes to work in a week.'
      this.todoList.append(p)
    } else {

      //aggregate variables
      var aggregateDay = 0
      var aggregateWeek = 0
      var aggregateMonth = 0
      var aggregateYear = 0

      // Create todo item nodes for each todo in state
      todos.forEach(todo => {
        aggregateDay = aggregateDay + todo.commuteInSeconds
        aggregateWeek = aggregateWeek + todo.commuteWeek
        aggregateMonth = aggregateMonth + todo.commuteMonth
        aggregateYear = aggregateYear + todo.commuteYear
        //console.log("total commute for everyone:  "+ aggregateDay)
        const li = this.createElement('li')
        li.id = todo.id

        // The todo item text will be in a contenteditable span
        const span = this.createElement('span')
        span.contentEditable = false
        span.classList.add('editable')
        
        // If the todo is complete, it will have a strikethrough
        if (todo.complete) {
          const strike = this.createElement('s')
          strike.textContent = todo.text
          span.append(strike)
        } else {
          // Otherwise just display the text
          span.textContent = todo.text
        }
        
        //Create array of options to be added to selectList
        var arrayList = [1, 2, 3, 4, 5, 6, 7];
        //Create and append select list for days commuting
        const selectList = this.createElement("select");
        selectList.setAttribute("id", "employeeDaysCommuting");
        //Create and append the options
        for (var i = 0; i < arrayList.length; i++) {
            var option = document.createElement("option");
            option.setAttribute("value", arrayList[i]);
            option.text = arrayList[i];
            selectList.appendChild(option);
        }
        selectList.value = todo.daysCommuting

        // The todos will also have a delete button
        const deleteButton = this.createElement('button', 'delete')
        deleteButton.textContent = 'Delete'

        li.append(span, selectList, deleteButton)

        // Append nodes to the todo list
        this.todoList.append(li)

        // Each entry to have commute metrics (day, week, month, year)
        //day
        const commuteDurationDayLabel = this.createElement('p')
        commuteDurationDayLabel.textContent = 'Time to Commute in a Day: ' + todo.commuteInSeconds + " minutes"
        this.todoList.append(commuteDurationDayLabel)
        //week
        const commuteDurationWeekLabel = this.createElement('p')
        commuteDurationWeekLabel.textContent = 'Time to Commute in a Week: ' + todo.commuteWeek + " hours"
        this.todoList.append(commuteDurationWeekLabel)
        //month
        const commuteDurationMonthLabel = this.createElement('p')
        commuteDurationMonthLabel.textContent = 'Time to Commute in a Month: ' + todo.commuteMonth + " hours"
        this.todoList.append(commuteDurationMonthLabel)
        //year
        const commuteDurationYearLabel = this.createElement('p')
        commuteDurationYearLabel.textContent = 'Time to Commute in a Year: ' + todo.commuteYear + " days"
        this.todoList.append(commuteDurationYearLabel)

        })

      // Each entry to have commute metrics (day, week, month, year)
      //aggregate day
      const commuteDurationDayAggregateLabel = this.createElement('p')
      commuteDurationDayAggregateLabel.textContent = 'Total commute time in a day for all team members: ' + aggregateDay + " minutes."
      this.aggregateList.append(commuteDurationDayAggregateLabel)
      //aggregate week
      const commuteDurationWeekAggregateLabel = this.createElement('p')
      commuteDurationWeekAggregateLabel.textContent = 'Total commute time in a week for all team members: ' + aggregateWeek + " hours."
      this.aggregateList.append(commuteDurationWeekAggregateLabel)
      //aggregate month
      const commuteDurationMonthAggregateLabel = this.createElement('p')
      commuteDurationMonthAggregateLabel.textContent = 'Total commute time in a month for all team members: ' + aggregateMonth + " hours."
      this.aggregateList.append(commuteDurationMonthAggregateLabel)
      //aggregate year
      const commuteDurationYearAggregateLabel = this.createElement('p')
      commuteDurationYearAggregateLabel.textContent = 'Total commute time in a year for all team members: ' + aggregateYear + " days."
      this.aggregateList.append(commuteDurationYearAggregateLabel)
    }
    console.log(todos)
  }//end displayTodos

  // Update temporary state
  _initLocalListeners() {
    this.todoList.addEventListener('change', event => {
      if (event.target.id === 'employeeDaysCommuting') {
        this._temporaryTodoEmployeeDaysCommuting = event.target.value
      }
    })
  }

  // Send the completed value to the model
  bindEditTodo(handler) {
    this.todoList.addEventListener('focusout', event => {
      if (this._temporaryTodoEmployeeDaysCommuting) {
        const id = parseInt(event.target.parentElement.id)

        handler(id, this._temporaryTodoEmployeeDaysCommuting)
        this._temporaryTodoEmployeeDaysCommuting = ''
      }
    })
  }

  // Create an element with an optional CSS class
  // requires the tag to indicate what html element to create, plus the name of the element
  createElement(tag, className) {
      const element = document.createElement(tag)
      if (className) element.classList.add(className)
      return element
  }

  // Retrieve an element from the DOM
  getElement(selector) {
      const element = document.querySelector(selector)
      return element
  }

  //method that does not take any arguments
  //returns the value of the element named 'input' which is an input element
  get _todoText() {
    return this.input.value
  }

  //getter for the daysCommuting
  get _todoDaysCommuting() {
    return this.selectList.value
  }

  //getter for the workplace address
  get _todoWorkplace() {
    return this.workplaceAddressInput.value
  }

  //method that does not take any arguments
  //sets the value of 'input' to an empty string
  _resetInput() {
    this.input.value = ''
  }

  //Event Listeners to submit, delete, checkboxToggle
  bindAddTodo(handler) {
    this.ButtonForm.addEventListener('submit', event => {
      event.preventDefault()
  
      if (this._todoText) {
        handler(this._todoText, this._todoDaysCommuting, this._todoWorkplace)
        this._resetInput()
      }
    })
  }
  
  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id)
  
        handler(id)
      }
    })
  }
  
  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)
  
        handler(id)
      }
    })
  }

}//end View

class Controller {

  constructor(model, view){
    this.model = model
    this.view = view

    //bind methods that are listening for the events to the view
    //when event happens, corresponding event handlers are evoked
    this.view.bindAddTodo(this.handleAddTodo)
    this.view.bindDeleteTodo(this.handleDeleteTodo)
    this.view.bindToggleTodo(this.handleToggleTodo)
    this.view.bindEditTodo(this.handleEditTodo)

    this.model.bindTodoListChanged(this.onTodoListChanged)

    // Display initial todos
    this.onTodoListChanged(this.model.todos)
  }//end constructor for Controller

  //method that's called every time a todo changes.
  //takes in the todo[] list
  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos)
  }

  //Event handlers
  //When an event is fired, handlers are called to respond to event

  handleAddTodo = (todoText, todoDaysCommuting, todoWorkplace) => {
    this.model.initMap(todoText, todoDaysCommuting, todoWorkplace)
  }
  
  handleEditTodo = (id, todoDaysCommuting) => {
    this.model.editTodo(id, todoDaysCommuting)
  }
  
  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id)
  }
  
  handleToggleTodo = (id) => {
    this.model.toggleTodo(id)
  }

}//end Controller

const app = new Controller(new Model(), new View())