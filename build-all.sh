#! /bin/sh
rm -rf dist/
npm run build
if [  $? != 0 ];then
    exit -1;
fi

cd web
npm run build
if [  $? != 0 ];then
    exit -1;
fi
cp -a dist ../dist/web

cd ../admin
npm run build
if [  $? != 0 ];then
    exit -1;
fi
cp -a dist ../dist/admin
