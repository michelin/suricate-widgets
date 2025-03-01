<div align="center">

<img src=".readme/logo.png" alt="Suricate"/>

# Suricate Widgets

[![GitHub Stars](https://img.shields.io/github/stars/michelin/suricate-widgets?logo=github&style=for-the-badge)](https://github.com/michelin/suricate)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?logo=apache&style=for-the-badge)](https://opensource.org/licenses/Apache-2.0)

[Getting Started](#creation) • [Suricate](https://github.com/michelin/suricate) • [DevTool](https://github.com/michelin/suricate-widget-tester)

Retrieve data from external sources and present it in a tile-based format on Suricate dashboards.

![Suricate dashboard developer environment](.readme/dashboard.gif)

</div>

## Table of Contents

* [Repository Harmonization](#repository-harmonization)
* [Repository Architecture](#repository-architecture)
* [Creation](#creation)
  * [Category](#category)
    * [Description](#description)
    * [Icon](#icon)
    * [Widgets](#widgets)
  * [Widget](#widget)
    * [Content](#content)
    * [Description](#description-1)
    * [Image](#image)
    * [Parameters](#parameters)
    * [Script](#script)
      * [Execution Logs](#execution-logs)
      * [Previous Execution Data](#previous-execution-data)
    * [Style](#style)
* [Suricate Widget Tester](#suricate-widget-tester)
* [Contribution](#contribution)

## Repository Harmonization

Since 
[this recent update](https://github.com/michelin/suricate-widgets/commit/82c2f2cc64e521352a8fd1398b957bac661776d9),
the repository has been reorganized to follow consistent conventions across all widgets.

This reorganization is fully compatible with all versions of Suricate.
However, the widget repository itself introduces some breaking changes.
To avoid these breaking changes, it is recommended to fork and use the [`old-master` branch](https://github.com/michelin/suricate-widgets/tree/old-master).

The changes are:
- Parameters for categories have been renamed to follow the `CATEGORY_` convention.  
- The SonarQube category's technical name has changed from `sonar` to `sonarqube`, creating a new category with new widgets.
- Widget technical names have been renamed to follow the kebab-case convention, resulting in new widgets.
- Parameters for widgets have been renamed to follow the `WIDGET_` convention.
- The `other` category has been split into `media` and `network` categories, creating new categories.

## Repository Architecture

The repository is organized as follows:

- **Content**: Contains all the widgets sorted by category.
  - **Category**: A widget category (e.g. Gitlab, GitHub, Jenkins, etc.).
    - **Widgets**: Contains all the widgets of the category.
      - **Widget**: A widget.
        - **content.html**: The HTML content of the widget.
        - **description.yml**: The description of the widget.
        - **image.png**: The image of the widget.
        - **params.yml**: The parameters of the widget.
        - **script.js**: The process content of the widget, defining what the widget does.
        - **style.css**: CSS styles to apply to the widget HTML content.
    - **description.yml**: The description of the category.
    - **icon.png**: The icon of the category.
- **Libraries**: Contains all the JavaScript libraries used by all the widgets.

## Creation 

To create a repository of widgets, follow the steps below.

### Category

A category is a folder that contains all the widgets related to a specific topic.
It contains the following files:
- A `description.yml` file that describes the category.
- An `icon.png` file to associate an icon with the category in the Suricate application.
- A folder that contains all the widgets related to this category.

#### Description

The `description.yml` file describes the category and contains associated parameters. Here is an example:

```yml
name: GitHub
technicalName: github
configurations:
  -
    key: 'CATEGORY_GITHUB_TOKEN'
    description: 'Token for the GitHub API'
    dataType: PASSWORD
```

Here are the possible parameters that can be set in this file:

| Param            | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|------------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`           | true     | The name of the category to display in Suricate.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `technicalName`  | true     | The primary key of the category. This is used by the back-end to uniquely identify a category.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `configurations` | false    | Parameters associated with the category. All the widgets of the category will share these parameters. Values are defined directly from the Configuration tab in the Suricate application. <br/><br/> Each parameter must declare the following properties: <ul><li>**key** - The name of the parameter used by the widget.</li> <li>**description** - A description for the parameter.</li> <li>**dataType** - The type of the parameter. It must be one of these types: "NUMBER", "TEXT", "PASSWORD".</li> |

#### Icon

The `icon.png` file contains the icon to be associated with the category. The icon will be displayed in the Suricate application.

#### Widgets

The widgets folder contains all the widgets linked to the category.

For more information about creating a widget, please see [the dedicated section](#widget).

### Widget

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
  <h1 class="title">{{WIDGET_GITHUB_PROJECT}}</h1>
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

- Display data computed by the Back-End from the "script.js" file.
- Display parameters from the "params.yml" file or the "description.yml" file of the related category.
- Display conditional content.

The variable `SURI_INSTANCE_ID` is available. This is a unique ID that identifies the widget instantiation on a dashboard. If you need to select the widget to use it in JavaScript or CSS, you can use the class selector `.widget-{{SURI_INSTANCE_ID}}`.

#### Description

The `description.yml` file provides information about the widget.

```yml
name: 'Count issues'
description: 'Count the number of issues in a GitHub repository.'
technicalName: 'github-count-issues'
delay: 300
```

The table below lists all possible parameters in this file:

| Param           | Required | Description                                                                                                                                                                                                                                                                                                          |
|-----------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`          | true     | The name of the widget to be displayed in Suricate.                                                                                                                                                                                                                                                                  |
| `technicalName` | true     | The primary key of the widget, used by the back-end to uniquely identify a widget.                                                                                                                                                                                                                                   |
| `description`   | true     | A short description of what the widget does.                                                                                                                                                                                                                                                                         |
| `info`          | false    | Usage information about the widget and what the user needs to do to get it to work.                                                                                                                                                                                                                                  |
| `delay`         | true     | The duration (in seconds) between each update of the widget. It can be set to -1 if the widget does not need to start the `script.js` file.                                                                                                                                                                          |
| `timeout`       | false    | The timeout duration (in seconds) for the widget execution. If it exceeds this duration, the widget will be stopped.                                                                                                                                                                                                 |
| `libraries`     | false    | A list of the names of all the external JavaScript libraries required by the widget. The libraries must be manually imported as minified files into the `libraries` folder at the root of the widget repository. The libraries will be injected into the DOM at execution so that they are available for the widget. |

#### Image

An `image.png` file contains the image associated with the widget, which will be displayed in the Suricate application.

#### Parameters

The `params.yml` file describes the parameters of the widget that are displayed in the Suricate application when the user selects the widget to add it to a dashboard. 
The user can set values to the parameters directly from the application, which can then be used in the `script.js` file or the `content.html` file.

The `params.yml` file must adhere to the following rules:
- The file should always start with the `widgetParams` keyword.
- The parameters have to be described after this keyword as a YAML list format.

```yml
widgetParams:
  - name: 'WIDGET_GITHUB_ORGANIZATION'
    description: 'GitHub organization'
    type: 'TEXT'
    required: true
  - name: 'WIDGET_GITHUB_PROJECT'
    description: 'GitHub project'
    type: 'TEXT'
    required: true
  - name: 'WIDGET_GITHUB_ISSUES_STATE'
    description: 'Filter on the state of the issues'
    type: 'COMBO'
    defaultValue: 'all'
    possibleValuesMap:
      - jsKey: 'all'
        value: 'All'
      - jsKey: 'open'
        value: 'Open'
      - jsKey: 'closed'
        value: 'Closed'
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
| `acceptFileRegex`   | false    | A regular expression to validate the file name when the parameter type is **FILE**.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `required`          | true     | Defines whether the parameter is required or not.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

#### Script

The `script.js` file is the core of the widget. 
It contains the business process of the widget and defines what the widget does. 
Most of the time, it submits requests to REST APIs and processes the retrieved data to send to the front-end.

How does the script work?
- It is executed by the Suricate Back-End with [GraalVM Polyglot](https://www.graalvm.org/latest/reference-manual/polyglot-programming/#start-language-java).
- It has to define a function named `run`. All the data returned by the `run` function has to be stringified in a JSON format using `JSON.stringify(data)`.
- The calls to the REST APIs have to be done by invoking `Packages.get()` or `Packages.post()`. It will invoke one of the `get` or `post` methods in the [Suricate Back-End](https://github.com/michelin/suricate/blob/master/src/main/java/com/michelin/suricate/service/js/script/JsEndpoints.java). 

```javascript
function run() {
  var data = {};
  var perPage = 100;
  var issues = [];
  var page = 1;

  var response = JSON.parse(
          Packages.get("https://api.github.com/repos/" + WIDGET_GITHUB_ORGANIZATION + "/" + WIDGET_GITHUB_PROJECT + "/issues?page=" + page + "&per_page=" + perPage + "&state=" + WIDGET_GITHUB_ISSUES_STATE,
                  "Authorization", "token " + CATEGORY_GITHUB_TOKEN));
  
  return JSON.stringify(data);
}
```

##### Execution Logs

To display execution logs in the Suricate application, use the `print()` method.

```javascript
function run() {
  var data = {};
  var perPage = 100;
  var issues = [];
  var page = 1;

  var response = JSON.parse(Packages.get('...'));

  print(response);

  return JSON.stringify(data);
}
```

##### Previous Execution Data

The previous execution data is accessible as a JSON object in the `SURI_PREVIOUS` variable.

```javascript
function run() {
  var data = {};
  var previousData = JSON.parse(SURI_PREVIOUS);
  
  return JSON.stringify(data);
}
```

#### Style

This `style.css` file is used to add CSS style to the widget.

Usage information:
- It is a pure CSS style file.
- All the classes have to be prefixed by `.widget.<technicalname>` to be applied to the widget.
This class is unique to the widget and is added by Suricate when the widget is displayed on the dashboard.
The technical name is the one defined in the _description.yml_ file of the widget.

```CSS
.widget.github-count-issues {
  background-color: #FFFFFF;
}

.widget.github-count-issues .title {
  color: #1B1F23;
  text-transform: capitalize;
}
```

## Suricate Widget Tester

The Suricate Widget Tester is a tool that helps you to test your widget. It is available at https://github.com/michelin/suricate-widget-tester.

## Contribution

We welcome contributions from the community! Before you get started, please take a look at our [contribution guide](https://github.com/michelin/suricate-widgets/blob/master/CONTRIBUTING.md) to learn about our guidelines and best practices. We appreciate your help in making Suricate a better tool for everyone.
