# Continuous monitoring widgets

This repository is used to store and track all widgets modifications of the continuous monitoring dashboard.

## Repository architecture

- **Content folder**
    - **Category 1**
        - **Widget**
            - **Widget name 1**
                -  content.hml (HTML content of the widget)
                -  description.yml (Widget description)
                -  image.png (Widget image)
                -  script.js (Widget script used to launch widget processing)
                -  style.css  (Widget style)
            - **Widget name 2**
                -  content.hml (HTML content of the widget)
                -  description.yml (Widget description)
                -  image.png (Widget image)
                -  script.js (Widget script used to launch widget processing)
                -  style.css  (Widget style)
        - description.yml (Category description)
        - icon file (category icon optional)
    - **Category 2**
        - description.yml (Category description)
        - icon file (category icon optional)
- **libraries**
    - chart.js (list of libraries used by widgets)
    - ...


## How create a Widget

A widget is a folder containing a list of files inside.<br/>

**content.html**<br/>
This file is used to display the widget on a dashboard.<br/>
It containt the HTML code of the widget.<br/>
It's a template so you can define or display conditional content with mustache [Documentation](https://mustache.github.io/mustache.5.html)

```html
<div class="grid-stack-item-content-inner">
    <h1 class="title">Gitlab users</h1>
    <h2 class="value">{{currentValue}}</h2>
    <p class="change-rate">
        <i class="fa fa-arrow-{{arrow}}"></i><span>{{difference}}</span>
    </p>
</div>
<p class="more-info">#Number of user</p>
```

In this file, you can also used all variables defined in the script.js.<br/>
The variable SURI_INSTANCE_ID is also available, it's used to defined the widget instance id to target a specific widget.<br/>
By default, the root div of a widget defined the html class "".widget-< SURI_INSTANCE_ID >"<br/>

To avoid the html escape of an mustache value, you can used {{{key}}} with three brackets<br/>
You can find the [Mustache template engine documentation](http://mustache.github.io/mustache.5.html) to use more tags type.

**description.yml**<br/>
File used to describe the widget.

```yml
name: Gitlab Users 
description: Widget used to display the current number of user in gitlab
technicalName: gituser
delay: 300
libraries:
  - d3.js
  - timeknots.js
```
All these fields are required (except libraries).<br/>
The delay field is the time between two updates for your widget (in seconds). When the delay is -1 the widget is never launched.

You can also add a field called 'info' to display a warning message on the interface.<br/>
The field 'timeout' is also available to override the default widget timeout (in seconds). 

**script.js**<br/>
The widget script is launched by the backend (not in the browser).<br/>
Your script must define on top all variables required by the user for your widget
<u>Documentation</u>
```
// SURI_XXX::FIELD_LABEL::TYPE::PLACEHOLDER::REQUIRED
```
| Varibale | Description |
| -------- | -------- |
| SURI_XXX | The variable name, this variable must start with SURI_ and it can be used directly in script.js and content.html files  |
| FIELD_LABEL | Your field label   |
| TYPE | Variable type STRING&#124;SECRET&#124;BOOLEAN&#124;INTEGER&#124;FILE&#124;COMBO&#124;MULTIPLE  |
| DATA | Field data used as placeholder, as list of value when type is COMBO or MULTIPLE 'KEY:VALUE,KEY2:VALUE2,...' or used as file type regex for FILE  |
| REQUIRED | Indicate if the field is required (REQUIRED by default) REQUIRED&#124;OPTIONAL   |

<u>Exemple:</u>

```
// SURI_TOKEN::Gitlab token used to access to the admin API (Settings > Access token)::SECRET::Gitlab > Settings > access tokens > Generate new
```

:warning: Information
* Your script must define a function named **run**
* In your script all data returned in the function run **must be in JSON**
* Two variables are injected in the script
    * SURI_PREVIOUS - it conatains the previous data stored by the last widget execution
    * SURI_INSTANCE_ID - it contains the id of the widget instance
    
In your script, prefer declaring a global account to access to all webservices. Your constant must start with WIDGET_CONFIG_.

<u>Exemple:</u>

```javascript
// SURI_DELAI::Span time to compare widget data in hours::INTEGER::24
//
function run (){
    // previous data
    var data = JSON.parse(SURI_PREVIOUS);
    var number = Packages.call("https://gitlab.com/api/v4/users", "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN, "x-total");
    if (number == null) {
        if (data.currentValue == null){
            return data;
        }
        number = data.currentValue;
    }

    if (data.old == undefined) {
        data.old = [];
    }

    if (data.old.length != 0){
        if (data.old[0].time < new Date().getTime() - SURI_DELAI * 3600000) {
            data.old.shift();
        }
    }

    var value = {};
    value.data = data.currentValue;
    if (isNaN(value.data)){
        value.data = number;
    }
    value.time = new Date().getTime();
    data.old.push(value);

    data.currentValue = number;
    var diff = (((number - data.old[0].data) * 100) / data.old[0].data);
    if (isNaN(diff)){
        diff = 0;
    }

    if (data.currentValue ==null){
        data.old.shift();
    }

    data.difference =  diff.toFixed(1) + "%";
    data.arrow = diff == 0 ? '' : (diff > 0 ? "up" : "down");

    return JSON.stringify(data);
}
```


**style.css**<br/>
File used to display widget style.<br/>
it's a pure css style file.<br/>
All widget syle must be prefixed by ".widget.< technicalname >", the technicalname must be defined in the description.yml.<br/>




