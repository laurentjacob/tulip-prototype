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

		Ads.find({limit: NUMBER_OF_ADS, skip: skipAmount, sort: 'createdAt DESC' })
		.then(function(ads) {
			var ads_to_send = ads.filter(function(ad) { return ad.status === "available" })
				.map(function(ad) {
					return {
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
			where: {'contains': searchStr}, 
			limit: NUMBER_OF_ADS, 
			skip: skipAmount, 
			sort: 'createdAt DESC'
		})
		.then(function(ads) {
			var ads_to_send = ads.filter(function(ad) { return ad.status === "available" })
				.map(function(ad) {
					return {
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
				dirname: require('path').resolve(sails.config.appPath, '/assets/images'),
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
				    var baseUrl = sails.getBaseUrl();

				    console.log("uploadedFiles ", uploadedFiles);
				    console.log("uploadedFiles[0] ", uploadedFiles[0]);				    

				    res.status(200).send("Working so far");

				    // Ads.create({
				    // 	title: title,
				    // 	description: description,
				    // 	price: price,
				    // 	imageUrl: "",
				    // 	imageFd: uploadedFiles[0].fd
				    // })

				    // http://sailsjs.org/#!/documentation/concepts/File-Uploads

				    // Create the ad

				    // return 201 with id if it successfully created
			    }

			})
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
	}
};












