<h1 align="center"> Entry Control </h1>
<p align="center">
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/edumoritz/entry-control?color=orange">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/edumoritz/entry-control">
	
  <a href="https://www.linkedin.com/in/eduardo-moritz-5298a0118/">
    <img alt="Made by Eduardo Moritz" src="https://img.shields.io/badge/made%20by-edumoritz-orange">
  </a>

  <a href="https://github.com/edumoritz/entry-control/commits/master">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/edumoritz/entry-control">
  </a>

  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen">
</p>

<p align="center">
  <a href="#-project">Project</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-technologies">Technologies</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-backend">Backend</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-license">License</a>
</p>

## 💻  Project

This is a backend of tests of control of entry and exit of any establishment, with many test cases in jest, it is possible to make the reservation, make the check-in and the checkout.

## 👾  Technologies

This project is being developed with the following technologies:

- [Node.js][nodejs]
- [Jestjs][Jestjs]
- [date-fns][datefns]

## 🌚  Backend

Note: Before starting the app must contain the .env file at the root of the project containing the database connection and the secret to jwt.

The backend contains tests made with jest, to run the tests you need to use the command:
```bash
# Create the database
$ npm run knex:migrate

# Create the admin
$ npm run knex:seed
```

After running seed, you must enter the passwords generated in the tests and set the secret in the .env file.

```bash
# Go into the test 
$ npm run secure-mode
```

## 📝 License

This project is under the MIT license. See the [LICENSE](LICENSE.md) for details.
Made with ♥ by Eduardo Moritz :wave: [Get in touch!](https://www.linkedin.com/in/eduardo-moritz-5298a0118/)

[nodejs]: https://nodejs.org/
[jestjs]: https://jestjs.io/
[datefns]: https://date-fns.org/