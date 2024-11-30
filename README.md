<div align="center">

<img src=".readme/logo.png" alt="suricate logo"/>

# Suricate Widgets

[![GitHub Stars](https://img.shields.io/github/stars/michelin/suricate-widgets?logo=github&style=for-the-badge)](https://github.com/michelin/suricate)
[![GitHub Watch](https://img.shields.io/github/watchers/michelin/suricate-widgets?logo=github&style=for-the-badge)](https://github.com/michelin/suricate)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?logo=apache&style=for-the-badge)](https://opensource.org/licenses/Apache-2.0)

[Getting Started](#creation) • [Suricate](https://github.com/michelin/suricate-widgets) • [DevTool](https://github.com/michelin/suricate-widget-tester)

Retrieve data from external sources and present it in a tile-based format on Suricate dashboards.

![Suricate dashboard developer environment](.readme/dashboard.gif)

</div>

## Table of Contents

* [Repository Architecture](#repository-architecture)
* [Creation](#creation)
  * [Creating a Category](#creating-a-category)
  * [Creating a Widget](#creating-a-widget)
* [Suricate Widget Tester](#suricate-widget-tester)
* [Contribution](#contribution)

## Repository Architecture

📁 **Content** - Contains all the widgets sorted by category.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 📁 **Category 1** - A widget category (e.g. Gitlab, GitHub, Jenkins, etc.).

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 📁 **Widgets** - Contains all the widgets of the category.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 📁 **Widget 1** - A widget.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 📄 **content.html** - The HTML content of the widget.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 📄 **description.yml** - The description of the widget.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ♐ **image.png** - The image of the widget.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 📄 **params.yml** - The parameters of the widget.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 📜 **script.js** - The process content of the widget, defining what the widget does.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 📄 **style.css** - CSS styles to apply to the widget HTML content.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 📄 **description.yml** - The description of the category.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ♐ **icon.png** - The icon of the category.

📁 **Libraries** - Contains all the JavaScript libraries used by all the widgets.

## Creation 

If you want to create your own widget and category in Suricate, you can follow these steps.

### Creating a Category

A widget **category** is a folder that contains: 
- A `description.yml` file that describes the category
- An `icon.png` file to associate an icon with the category in the Suricate application
- A folder that contains all the widgets related to this category

#### Description

The `description.yml` file describes the category and contains associated parameters. Here is an example:

```yml
name: GitHub
technicalName: github
configurations:
  -
    key: 'WIDGET_CONFIG_GITHUB_TOKEN'
    description: 'Token for the GitHub API'
    dataType: PASSWORD
```

Here are the possible parameters that can be set in this file:

| Param          | Required | Description |
| -------------- | -------- | ----------- |
| `name`           | true     | The name of the category to display in Suricate. |
| `technicalName`  | true     | The primary key of the category. This is used by the back-end to uniquely identify a category. |
| `configurations` | false    | Parameters associated with the category. All the widgets of the category will share these parameters. Values are defined directly from the _Configuration_ tab in the Suricate application. <br/><br/> Each parameter must declare the following properties: <ul><li>**key** - _The name of the parameter used by the widget. It must start by WIDGET_CONFIG._</li> <li>**description** - _A description for the parameter._</li> <li>**dataType** - _The type of the parameter. It must be one of these types: "NUMBER", "TEXT", "PASSWORD"._</li> |

#### Icon

The `icon.png` file contains the icon to be associated with the category. The icon will be displayed in the Suricate application.

#### Widgets

The `Widgets` folder contains all the widgets linked to the category.

For more information about creating a widget, please see [the dedicated section](#create-a-widget).

### Creating a Widget

A widget is a folder containing the following files:
- A `content.html` file that displays the widget in a tile format on Suricate dashboards.
- A `description.yml` file that provides a description of the widget.
- A `image.png` file that is used to associate an image with the widget in the Suricate application.
- A `params.yml` file that describes the parameters of the widget.
- A `script.js` file that contains the business logic of the widget in JavaScript.
- A `style.css` file that contains the CSS style of the widget to apply to the HTML.

#### Content

The `content.html` file is responsible for displaying the widget on Suricate dashboards and provides the tile format for the widget. It contains the HTML code of the widget.

```html
<div class="grid-stack-item-content-inner">
	<h1 class="title">{{SURI_GITHUB_PROJECT}}</h1>
	<h2 class="value">{{numberOfIssues}}</h2>
	<h2 class="issues-label">{{#issuesState}} {{issuesState}} {{/issuesState}} issues</h2>

	{{#evolution}}
	<p class="change-rate">
	  <i class="fa fa-arrow-{{arrow}}"></i><span>{{evolution}}% since the last execution</span>
	</p>
	{{/evolution}}
</div>
<div class="github"></div>
```

This file is a template that will be compiled with [Mustache](https://mustache.github.io/mustache.5.html), so feel free to use the provided directives to:

- Display data computed by the Back-End from the "script.js" file
- Display parameters from the "params.yml" file or the "description.yml" file of the related category
- Display conditional content

Note that the variable `SURI_INSTANCE_ID` is available. This is a unique ID that identifies the widget instantiation on a dashboard. If you need to select the widget to use it in JavaScript or CSS, you can use the class selector `.widget-{{SURI_INSTANCE_ID}}`.

As in the example above, it is possible to add custom JavaScript or calls to JavaScript libraries to improve the widget display.

#### Description

The `description.yml` file provides information about the widget. The following is its content:

```yml
name: Number of issues
description: Display the number of issues of a GitHub project
technicalName: githubOpenedIssues
delay: 600
```

The table below lists all possible parameters in this file:

| Param         | Required | Description |
| -----         | -------- | ----------- |
| `name`          | true     | The name of the widget to be displayed in Suricate. |
| `technicalName` | true     | The primary key of the widget, used by the back-end to uniquely identify a widget. |
| `description`   | true     | A short description of what the widget does. |
| `info`          | false    | Usage information about the widget and what the user needs to do to get it to work. |
| `delay`         | true     | The duration (in seconds) between each update of the widget. It can be set to -1 if the widget does not need to start the `script.js` file. |
| `timeout`       | false    | The timeout duration (in seconds) for the widget execution. If it exceeds this duration, the widget will be stopped. |
| `libraries`     | false    | A list of the names of all the external JavaScript libraries required by the widget. The libraries must be manually imported as minified files into the `libraries` folder at the root of the widget repository. The libraries will be injected into the DOM at execution so that they are available for the widget. |

#### Image

An `image.png` file contains the image associated with the widget, which will be displayed in the Suricate application.

#### Params

The `params.yml` file describes the parameters of the widget that are displayed in the Suricate application when the user selects the widget to add it to a dashboard. The user can set values to the parameters directly from the application, which can then be used in the `script.js` file or the `content.html` file.

The `params.yml` file must adhere to the following rules:
- The file should always start with the `widgetParams` keyword.
- The parameters have to be described after this keyword as a YAML list format.

```yml
widgetParams:
  -
    name: 'SURI_GITHUB_ORG'
    description: 'GitHub organization'
    type: TEXT
    required: true
  -
    name: 'SURI_GITHUB_PROJECT'
    description: 'GitHub project'
    type: TEXT
    required: true
  -
    name: 'SURI_ISSUES_STATE'
    description: 'Filter on the state of the issues'
    type: COMBO
    defaultValue: 'all'
    possibleValuesMap:
      -
        jsKey: all
        value: All
      -
        jsKey: open
        value: Open
      -
        jsKey: closed
        value: Closed
    required: true
```

The following table lists all available parameters for the `params.yml` file:

| Param               | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|---------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`              | true     | The name of the variable. It has to start with the keyword "_SURI__". Then the variable can be used in the _script.js_ file and the _content.html_ file. It will hold the value set by the user in the Suricate application.                                                                                                                                                                                                                                                                               |
| `description`       | true     | The description of the parameter. Describe the expected value. It will be displayed as an input label to the user.                                                                                                                                                                                                                                                                                                                                                                                         |
| `type`              | true     | The data type of the parameter. <br /> Here is the full list of available types to define in uppercase: <ul><li>**TEXT** - display a text input</li> <li>**TEXTAREA** - display a text area input</li> <li>**PASSWORD** - display a password input</li> <li>**BOOLEAN** - display a check box</li> <li>**NUMBER** - display a number input</li> <li>**COMBO** - display a combo box</li> <li>**MULTIPLE** - display a combo box with check boxes</li> <li>**FILE** - display a file upload input</li></ul> |
| `possibleValuesMap` | false    | Contains the possible values of a combo box. This has to be set if the type of the parameter is **COMBO** or **MULTIPLE**. <br /> There are two pieces of information to set: <ul><li>**jsKey** - The key of the option, especially to use it in the _script.js_ file</li> <li>**value** - The related value displayed to the user in the Suricate application</li></ul>                                                                                                                                   |
| `defaultValue`      | false    | The default value to set for the parameter. It will be displayed in the input by default in the Suricate application.                                                                                                                                                                                                                                                                                                                                                                                      |
| `usageExample`      | false    | An example of how to fill the parameter.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `usageTooltip`      | false    | A message to display in a tooltip when configuring the widget.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `required`          | true     | Defines whether the parameter is required or not.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

#### Script

The `script.js` file is the core of the widget. It contains the business process of the widget and defines what the widget does. Most of the time, it submits requests to REST APIs and processes the retrieved data to send to the front-end.

How does the script work?
- It is executed by the Spring Boot back-end with [Nashorn](https://en.wikipedia.org/wiki/Nashorn_(JavaScript_engine)).
- It has to define a function named _run_. This is the function executed by the back-end. All the data returned by the _run_ function has to be stringified in a JSON format.
- The calls to the REST APIs have to be done by invoking **Packages.get()** or **Packages.post()**. It will invoke one of the _get_ or _post_ methods in the [Suricate back-end](https://github.com/michelin/suricate/blob/master/src/main/java/com/michelin/suricate/services/nashorn/script/NashornWidgetScript.java). 

```javascript
function run() {
	var data = {};
	var perPage = 100;
	var issues = [];
	var page = 1;
	
	var response = JSON.parse(Packages.get("https://api.github.com/repos/" + SURI_GITHUB_ORG + "/" + SURI_GITHUB_PROJECT + "/issues?page=" + page + "&per_page=" + perPage + "&state=" + SURI_ISSUES_STATE, "Authorization", "token " + WIDGET_CONFIG_GITHUB_TOKEN));
	
	issues = issues.concat(response);

	...
	
	data.numberOfIssues = issues.length;
	
	return JSON.stringify(data);
}
```

#### Style

This `style.css` file is used to add CSS style to the widget.

Usage information:
- It is a pure CSS style file.
- All the classes have to be prefixed by `.widget.<technicalname>`. The technical name is the one defined in the _description.yml_ file of the widget.

```CSS
.widget.githubOpenedIssues {
	background-color: #FFFFFF;
}

...

.widget.githubOpenedIssues .issues-label {
	color: #1B1F23;
	font-size: 40px;
}
```

## Suricate Widget Tester

The Suricate Widget Tester is a tool that helps you testing your widget. It is available at https://github.com/michelin/suricate-widget-tester.

## Contribution

We welcome contributions from the community! Before you get started, please take a look at our [contribution guide](https://github.com/michelin/suricate-widgets/blob/master/CONTRIBUTING.md) to learn about our guidelines and best practices. We appreciate your help in making Suricate a better tool for everyone.
