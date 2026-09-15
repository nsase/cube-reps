# Angular SW migration fixture

`ngsw-worker.js` is the unmodified worker from `@angular/service-worker@21.2.20`
on npm. Its MIT license is included. It is served only by the migration browser
test and is not included in the application build. Keep this fixture unchanged
so the test continues to cover upgrades from the previously shipped worker.
