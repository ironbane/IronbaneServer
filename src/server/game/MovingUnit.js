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


var MovingUnit = Unit.extend({
    Init: function(data) {


        this._super(data);

        //the steering behavior class
        this.steeringBehaviour = new SteeringBehaviour(this);

        // this.testTimer = 0.0;
        this.targetPosition = new THREE.Vector3();

        this.steeringForce = new THREE.Vector3();



    },
    Tick: function(dTime) {

        var acceleration = this.steeringForce.multiplyScalar(this.mass);

        this.velocity.addSelf(acceleration.multiplyScalar(dTime));

        this.velocity.Truncate(this.maxSpeed);

        this.position.addSelf(this.velocity.clone().multiplyScalar(dTime));

        if ( this.velocity.length() > 0.2 ) {

            this.heading = this.velocity.clone().normalize();

            this.side = this.heading.clone().Perp();

        }

        var cellPos = WorldToCellCoordinates(this.position.x, this.position.z, cellSize);
        if ( cellPos.x !== this.cellX || cellPos.z !== this.cellZ ) {
              this.ChangeCell(cellPos.x, cellPos.z);
        }


        this._super(dTime);

    }
});
