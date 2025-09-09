const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryArea = sequelize.define('DeliveryArea', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fee: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    deliveryTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'delivery_areas',
    timestamps: true,
  });

  return DeliveryArea;
};
