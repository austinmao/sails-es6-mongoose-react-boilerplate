# install commonly used npm packages

# if brand new install
# ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
# brew update
# sudo brew install node
# sudo brew install mongodb
# sudo npm install mocha -g
# sudo npm install should -g
# sudo npm install sails -g
# sudo npm install localtunnel -g

# if using sails
# sails new fomo --template=jade
# cd fomo
npm install sails-generate-auth --save
npm install sails-mongo --save
npm install sails-redis --save
npm install sails-hook-email --save

# if using hackathon starter
# git clone --bare https://github.com/sahat/hackathon-starter.git myproject
# cd myproject
# git remote rm origin
# npm install

# utility libs
npm install lodash --save
npm install bluebird --save
npm install brunch --save
npm install chalk --save
npm install moment --save
npm install is_js --save
npm install natural --save
npm install should --save
npm install jade --save
npm install fs-extra --save
npm install passport --save

# advanced libs
npm install kue --save
npm install babel-core --save