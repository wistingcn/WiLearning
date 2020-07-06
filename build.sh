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

# build server
build_server() {
	if [ ! -d "node_modules" ];then
		npm_command i
	fi

	npm run build

	if [  $? != 0 ];then
    exit -1;
	fi
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
	;;
	server)
		build_server
	;;
	admin)
		rm -rf dist/admin
		build_admin
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
