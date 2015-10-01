#!/bin/bash
mongo sails --eval "db.dropDatabase()"
mongo sails-test --eval "db.dropDatabase()"
