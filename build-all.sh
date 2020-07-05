#! /bin/sh

if command -v cnpm &> /dev/null; then
	alias npm_command='cnpm'
elif command -v npm &> /dev/null; then
	alias npm_command='npm'
fi

npm_command -v
if [  $? != 0 ];then
	echo "Please install nodejs first!"
	exit -1;
fi



# build server
rm -rf dist/
if [ ! -d "node_modules" ];then
	npm_command i
fi
npm run build
if [  $? != 0 ];then
    exit -1;
fi

# build web client
cd web
if [ ! -d "node_modules" ];then
	npm_command i
fi
npm run build
if [  $? != 0 ];then
    exit -1;
fi
cp -a dist ../dist/web

# build web admin
cd ../admin
if [ ! -d "node_modules" ];then
	npm_command i
fi
npm run build
if [  $? != 0 ];then
    exit -1;
fi
cp -a dist ../dist/admin
