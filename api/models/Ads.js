/**
* Ads.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  schema: true,

  attributes: {
  	
  	price:  {
  		type: "float"
  	},
  	title: {
  		type: "string"
  	},
  	description: {
  		type: "string"
  	},
  	imageFd: {
  		type: "string"
  	},
  	imageUrl: {
  		type: "string"
  	},
  	status: {
  		type: 'string',
    	enum: ['available', 'pending', 'approved', 'denied'],
    	defaultsTo: 'available'
  	}

  }
};

