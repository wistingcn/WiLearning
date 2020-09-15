#! /bin/sh

if command -v cnpm &> /dev/null; then
	alias npm_command='cnpm'
elif command -v npm &> /dev/null; then
	alias npm_command='npm'
fi

npm_command -v &> /dev/null
if [  $? != 0 ];then
	echo "Please install nodejs first!"
	exit -1;
fi

mkdir dist
mkdir -p /var/run/wilearning/public/

# build server
build_server() {
	cd server
	if [ ! -d "node_modules" ];then
		npm_command i
	fi

	rm -rf dist
	npm run build

	if [  $? != 0 ];then
    exit -1;
	fi

	cp -a dist/* ../dist/
	cp -a node_modules ../dist/
	cd ..
}


# build web client
build_web() {
	cd web
	if [ ! -d "node_modules" ];then
		npm_command i
	fi

	npm run build
	if [  $? != 0 ];then
    exit -1;
	fi

	cp -a dist ../dist/web
	cd ..
}

# build web client
build_app() {
	cd app 
	if [ ! -d "node_modules" ];then
		npm_command i
	fi

	npm run build
	if [  $? != 0 ];then
    exit -1;
	fi

	cp -a www ../dist/app
	cd ..
}

# build web admin
build_admin() {
	cd admin
	if [ ! -d "node_modules" ];then
		npm_command i
	fi

	npm run build
	if [  $? != 0 ];then
    exit -1;
	fi

	cp -a dist ../dist/admin
	cd ..
}

case "$1" in
	all)
		rm -rf dist/
		build_server
		build_web
		build_admin
		build_app
	;;
	server)
		build_server
	;;
	admin)
		rm -rf dist/admin
		build_admin
	;;
	app)
		rm -rf dist/app
		build_app
	;;
	web)
		rm -rf dist/web
		build_web
	;;
	*)
	echo
	echo "Usage: ./build.sh [all/admin/web/server]"
	echo
	;;
esac
