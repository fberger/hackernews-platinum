#!/bin/bash

set -e

version=$1
force=$2

output_dir=/tmp/hackernews-platinum-$version
PRIVATE_KEY=/home/felix/.hackernews-platinum.pem
if [[ ! $version ]]; then
    echo "Needs a version number as argument"
    exit 1
fi

echo "Releasing version ${version}"

echo "Setting version number in manifest.json"
sed -i "s/version\":.*/version\": \"${version}\"/" manifest.json

if [[ $(git diff | grep manifest.json) ]]; then
    echo "Committing changes"
    git add manifest.json
    git commit -m"Releasing version $version"
fi

echo "Tagging locally"
git tag $force $version

echo "Pushing tag"
git push --tags origin master

echo "Creating directory"
rm -rf $output_dir
mkdir $output_dir

echo "Archiving"
git archive $version | tar -x -C $output_dir

echo "Copying private key"
cp $PRIVATE_KEY $output_dir/key.pem

echo "Creating zip file for webstore upload"
rm -f $output_dir.zip
zip -r $output_dir.zip $output_dir
