/**
 * AdsController
 *
 * @description :: Server-side logic for managing ads
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var NUMBER_OF_ADS = 10;

module.exports = {
	
	getAds: function(req, res) {

		var pageNumber = req.param('pageNumber') || 0;

		var skipAmount = NUMBER_OF_ADS * pageNumber;

		Ads.find({where: {status: 'available'}, limit: NUMBER_OF_ADS, skip: skipAmount, sort: 'createdAt DESC' })
		.then(function(ads) {
			var ads_to_send = ads.map(function(ad) {
					return {
						id: ad.id,
						title: ad.title,
						description: ad.description,
						imageUrl: ad.imageUrl,
						price: ad.price
					}
				})

			if(ads_to_send.length === 0) {
				res.status(400).send(Message.createError("No more ads found"));
			}
			else {
				res.status(200).send(Message.createSuccess("Fetched page " + pageNumber + " of all ads", ads_to_send));
			}
		})
		.catch(function(err) {
			res.status(500).send(Message.createError(err));
		});
	},

	searchAds: function(req, res) {
		
		var pageNumber = req.param('pageNumber') || 0;
		var skipAmount = NUMBER_OF_ADS * pageNumber;

		var searchStr = req.param('searchStr') || '';

		Ads.find({
			where: {
				title: {'contains': searchStr},
				status: 'available'
			}, 
			limit: NUMBER_OF_ADS, 
			skip: skipAmount, 
			sort: 'createdAt DESC'
		})
		.then(function(ads) {
			var ads_to_send = ads.map(function(ad) {
					return {
						id: ad.id,
						title: ad.title,
						description: ad.description,
						imageUrl: ad.imageUrl,
						price: ad.price
					}
				})

			if(ads_to_send.length === 0) {
				res.status(400).send(Message.createError("No more ads found"));
			}
			else {
				res.status(200).send(Message.createSuccess("Fetched page " + pageNumber + " of search ads", ads_to_send));
			}
		})
		.catch(function(err) {
			res.status(500).send(Message.createError(err));
		})
	},

	newAd: function(req, res) {
		var title = req.param('title');
		var description = req.param('description') || "";
		var price = req.param('price');
		var image = req.file('image');
		if (!title) {
			res.status(400).send(Message.createError("No title provided"));
		} 
		else if (!price) {
			res.status(400).send(Message.createError("No price provided"));
		} 
		else if(!image) {
			res.status(400).send(Message.createError("No image provided"));
		}
		else {
			req.file('image').upload({
				dirname: require('path').resolve(sails.config.appPath, 'images'),
				maxBytes: 10000000 // 10 MB
			}, function whenDone(err, uploadedFiles) {
				if (err) {
			    	res.status(500).send(Message.createError(err));
			    }

			    // If no files were uploaded, respond with an error.
			    else if (uploadedFiles.length === 0){
			    	res.status(400).send(Message.createError('No file was uploaded'));
			    }

			    else {

			    	// TODO: check that the file is actually an image
			    	//			 with uploadedFiles[0].type

			    	var fd = uploadedFiles[0].fd;
			    	var fileName = fd.substring(fd.lastIndexOf("/") + 1);

				    Ads.create({
				    	title: title,
				    	description: description,
				    	price: price,
				    	imageUrl: "images/" + fileName
				    })
				    .then(function(ad) {
				    	res.status(201).send(Message.createSuccess('Successfully posted an ad', {ad_id: ad.id}))
				    })
				    .catch(function(err) {
				    	res.status(500).send(Message.createError(err));
				    })
			    }
			})
		}
	},

	getStatus: function(req, res) {

		var ids = req.param('ids');

		if(ids.length === 0) {
			res.status(400).send(Message.createError('No ad_id was provided'));
		}
		else {
			Ads.find(ids)
			.then(function(ads) {
				if(ads.length === 0) {
					res.status(400).send(Message.createError('No valid ad_id was provided'));
				}
				else {
					res.status(200).send(Message.createSuccess(
						'Sending status for ' + ads.length + 'ads',	
						ads.map(function(ad) {
							return {
								id: ad.id,
								status: ad.status
							}
						}))
					);
				}
			})
			.catch(function(err) {
				res.status(500).send(Message.createError(err));
			});
		}
	},

	updateStatus: function(req, res) {
		var ad_id = req.param('ad_id');
		var newStatus = req.param('status');

		if(!ad_id) {
			res.status(400).send(Message.createError("No ad_id provided"));
		}
		else if (!newStatus) {
			res.status(400).send(Message.createError("No status provided"));
		} 
		else {
			Ads.update(
				{id: ad_id}, // which one
				{status: newStatus} // what changes
			)
			.then(function(updated_ad) {
				res.status(200).send(Message.createSuccess("Successfully updated the ad status", {}));
			})
			.catch(function(err) {
				sails.log(err);
				res.status(500).send(Message.createError(err));
			});
		}
	},

	getImage: function(req, res) {
		var fileName = req.param('name');

		var SkipperDisk = require('skipper-disk');
    var fileAdapter = SkipperDisk(/* optional opts */);

    // TODO: do checks on fileName

    var fd = sails.config.appPath + "/images/" + fileName;

    fileAdapter.read(fd)
    .on('error', function(err) {
    	res.status(500).send(Message.createError(err));
    })
    .pipe(res);
	}
};












