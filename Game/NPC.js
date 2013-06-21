/*
    This file is part of Ironbane MMO.

    Ironbane MMO is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ironbane MMO is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Ironbane MMO.  If not, see <http://www.gnu.org/licenses/>.
*/



var NPC = Fighter.extend({
    Init: function(data) {





        this._super(data);

        // HACKY HACKY!!! See LootBag

        // Set to the default template values
        this.param = this.template.param;
        this.size = this.template.size;
        this.health = this.template.health;
        this.armor = this.template.armor;
        // END HACKY


        this.maxSpeed = 2.0;
        this.rotationSpeed = 10.0;


        this.SetWeaponsAndLoot();


        // A sub node position, used in the path finding
        this.targetNodePosition = this.position.clone();

        // Used for calculating new paths every few seconds
        this.calculateNewPathTimeout = 0.0;


    },
    Awake: function(){
      this._super();




    },
    Tick: function(dTime) {

        if ( this.calculateNewPathTimeout >= 0 ) this.calculateNewPathTimeout -= dTime;

        this._super(dTime);

    },
    SetWeaponsAndLoot: function() {
        this.weapons = [];
        this.loot = [];
        this.weapon = null;

        // Store the weapons and loot
        if (!_.isEmpty(this.template.weapons)) {
            var weaponSplit = this.template.weapons.split(",");
            for (var w = 0; w < weaponSplit.length; w++) {
                this.weapons.push(dataHandler.items[parseInt(weaponSplit[w], 10)]);
            }

            if (this.weapons.length > 0) {
                this.weapon = this.weapons[0];
            }
        }

        var theLoot = "";
        // if we have JSON loot use that otherwise fall back to template
        if (this.data && !_.isEmpty(this.data.loot)) {
            theLoot = this.data.loot;
        } else if (!_.isEmpty(this.template.loot)) {
            theLoot = this.template.loot;
        }

        if (!_.isEmpty(theLoot)) {
            var lootSplit = theLoot.split(";");
            for (var l = 0; l < lootSplit.length; l++) {
                var item = null;

                // No percentages for vendors!
                if (this.template.type === UnitTypeEnum.VENDOR) {
                    item = parseInt(lootSplit[l], 10);
                } else {
                    var chanceSplit = lootSplit[l].split(":");

                    if (WasLucky100(parseInt(chanceSplit[0], 10))) {
                        item = parseInt(chanceSplit[1], 10);
                    }
                }

                if (item) {

                    if (!ISDEF(dataHandler.items[item])) {
                        log("Warning! item " + item + " not found for NPC " + this.id + "!");
                        continue;
                    }

                    var itemTemplate = dataHandler.items[item];

                    var temp = {
                        id: server.GetAValidItemID(),
                        template: item,
                        slot: l,
                        attr1: itemTemplate.attr1,
                        equipped: 0,
                        value: itemTemplate.basevalue || 0
                    };

                    if (this.template.type === UnitTypeEnum.VENDOR) {
                        // Specifiy a price
                        temp.price = CalculateItemPrice(temp);

                        // And an owner
                        temp.owner = this.id;
                    }

                    this.loot.push(temp);
                }
            }
        }

        //console.log('**** LOOT SET FOR: ', this.id, this.loot);
    },
    Jump: function() {
        this.EmitNearby("doJump", {
            id:this.id
        });

        this.jumpTimeout = 2.0;
    },
    // Return an array of nodes or positions that we can follow in order to reach our destination
    TravelToPosition: function(targetPosition, useSeek, deceleration) {
        var distance = DistanceSq(this.position, this.targetNodePosition);

        useSeek = useSeek || false;

        deceleration = deceleration || Deceleration.FAST;


        //log("TravelToPosition dist:");
        //console.log(distance);
        var targetPositionDistance = DistanceSq(this.position, targetPosition);

        // if ( distance < 1 || this.calculateNewPathTimeout <= 0) {
        if ( distance < 0.5 ) {
            this.calculateNewPathTimeout = 2.0;

            if ( targetPositionDistance > 1 ) {
                //log("[TravelToPosition] Calculating new path to "+targetPosition.ToString());
                this.CalculatePath(targetPosition);

                //log("[TravelToPosition] Node Path: "+this.targetNodePosition.ToString());
            }
        }

        if ( targetPositionDistance > 4 || useSeek ) {
            this.steeringForce = this.steeringBehaviour.Seek(this.targetNodePosition);
        }
        else {
            this.steeringForce = this.steeringBehaviour.Arrive(this.targetNodePosition, deceleration);
        }
    }
});
