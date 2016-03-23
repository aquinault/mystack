#!/bin/bash

USER="aq"
PASS="XX"
URL1="http://$USER:$PASS@es.cadesoft.com/annonces"
URL2="http://$USER:$PASS@es.cadesoft.com/adimages"
DEST="/home/aquinault/myESdumps"

# Restore index data to a file (ie : stored in /tmp/myESdumps) :
echo "Import annonces Data"
docker run --rm -ti -v $DEST:/data elasticdump \
  --output=$URL1 \
  --input=/data/my_annonces.json \
  --type=data

echo "Import annonces Mapping"
docker run --rm -ti -v $DEST:/data elasticdump \
  --output=$URL1 \
  --input=/data/my_annonces_mapping.json \
  --type=mapping

echo "Import adimages Data"
docker run --rm -ti -v $DEST:/data elasticdump \
  --output=$URL2 \
  --input=/data/my_adimages.json \
  --type=data

echo "Import adimages Mapping"
docker run --rm -ti -v $DEST:/data elasticdump \
  --output=$URL2 \
  --input=/data/my_adimages_mapping.json \
  --type=mapping

echo "Import Done!"