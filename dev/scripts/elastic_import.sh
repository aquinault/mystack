#!/bin/bash

USER="aq"
PASS="XX"
URL1="http://$USER:$PASS@es.cadesoft.com/annonces"
URL2="http://$USER:$PASS@es.cadesoft.com/adimages"

# Restore index data to a file (ie : stored in /tmp/myESdumps) :
echo "Export annonces Data"
docker run --rm -ti -v /tmp/myESdumps:/data elasticdump \
  --output=$URL1 \
  --input=/data/my_annonces.json \
  --type=data

echo "Export annonces Mapping"
docker run --rm -ti -v /tmp/myESdumps:/data elasticdump \
  --output=$URL1 \
  --input=/data/my_annonces_mapping.json \
  --type=mapping

echo "Export adimages Data"
docker run --rm -ti -v /tmp/myESdumps:/data elasticdump \
  --output=$URL2 \
  --input=/data/my_adimages.json \
  --type=data

echo "Export adimages Mapping"
docker run --rm -ti -v /tmp/myESdumps:/data elasticdump \
  --output=$URL2 \
  --input=/data/my_adimages_mapping.json \
  --type=mapping

echo "Export Done!"
