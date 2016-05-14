
class Atom
{
	constructor(element, mass, charge)
	{
		this.element = element;
		this.number = element.number;
		this.symbol = element.symbol;
		this.name = element.name;
		this.enegativity = element.enegativity;
		
		this.mass = mass || element.mass;
		this.charge = charge || 0;
		
		this.protons = this.number;
		this.electrons = this.number - this.charge;
		this.neutrons = Math.round(mass - this.protons);
		
		this.shells = getShell(this.electrons);
		this.shell = this.shells[this.shells.length - 1];
		
		if(this.mass != element.mass)
		{
			let disp = '-' + Math.round(this.mass);
			
			this.symbol += disp;
			this.name += disp;
		}
		
		if(this.charge != 0)
		{
			let disp = '<sup>' + (this.charge != 1 ? this.charge : '') + (this.charge > 0 ? '+' : '-') + '</sup>';
			
			this.symbol += disp;
			this.name += disp;
		}
	}
	
	ion(charge)
	{
		return new Atom(this.element, this.mass, charge);
	}
	
	iso(mass)
	{
		return new Atom(this.element, mass, this.charge);
	}
	
	toString()
	{
		return this.name;
	}
}

class Element extends Atom
{
	constructor(number, symbol, name, mass, enegativity)
	{
		super({number, symbol, name, mass, enegativity});
	}
	
	get element()
	{
		return this;
	}
	
	set element(value) {}
}

var shellTypes =
[
	{label: 's', max: 2},
	{label: 'p', max: 6},
	{label: 'd', max: 10},
	{label: 'f', max: 14},
	{label: 'g', max: 18},
];

function getShell(number)
{
	var shellIndex = 0;
	var level = 1;
	var result = [];
	while(number > 0)
	{
		var shell = shellTypes[shellIndex];
		
		number -= shell.max;
		result.push(level + shell.label + '<sup>' + (number < 0 ? shell.max + number : shell.max) + '</sup>');
		
		shellIndex++;
		if(shellIndex > level - 1 || shellIndex == shellTypes.length)
		{
			level++;
			shellIndex = 0;
		}
	}
	return result;
}

var elementLookup = {};

function addElement(number, symbol, name, mass, enegativity)
{
	var element = new Element(number, symbol, name, mass, enegativity);
	
	elementLookup[number] = element;
	elementLookup[symbol.toLowerCase()] = element;
	elementLookup[name.toLowerCase()] = element;
	elementLookup[element.shell.replace(/<[^>]+>/g, '')] = element;
	
	return element;
}

function E(selector)
{
	if(selector)
	{
		return elementLookup[selector.toString().toLowerCase()] || null;
	}
}

E.populate = (callback) =>
{
	for(var i = 1; i <= 118; i++) callback(elementLookup[i]);
}

addElement(2, 'He', 'Helium', 4.002602, 0);
addElement(3, 'Li', 'Lithium', 6.94, 0.98);
addElement(4, 'Be', 'Beryllium', 9.0121831, 1.57);
addElement(5, 'B', 'Boron', 10.81, 2.04);
addElement(6, 'C', 'Carbon', 12.011, 2.55);
addElement(7, 'N', 'Nitrogen', 14.007, 3.04);
addElement(8, 'O', 'Oxygen', 15.999, 3.44);
addElement(9, 'F', 'Fluorine', 18.998403163, 3.98);
addElement(10, 'Ne', 'Neon', 20.1797, 0);
addElement(11, 'Na', 'Sodium', 22.98976928, 0.93);
addElement(12, 'Mg', 'Magnesium', 24.305, 1.31);
addElement(13, 'Al', 'Aluminium', 26.9815385, 1.61);
addElement(14, 'Si', 'Silicon', 28.085, 1.9);
addElement(15, 'P', 'Phosphorus', 30.973761998, 2.19);
addElement(16, 'S', 'Sulfur', 32.06, 2.58);
addElement(17, 'Cl', 'Chlorine', 35.45, 3.16);
addElement(18, 'Ar', 'Argon', 39.948, 0);
addElement(19, 'K', 'Potassium', 39.0983, 0.82);
addElement(20, 'Ca', 'Calcium', 40.078, 1);
addElement(21, 'Sc', 'Scandium', 44.955908, 1.36);
addElement(22, 'Ti', 'Titanium', 47.867, 1.54);
addElement(23, 'V', 'Vanadium', 50.9415, 1.63);
addElement(24, 'Cr', 'Chromium', 51.9961, 1.66);
addElement(25, 'Mn', 'Manganese', 54.938044, 1.55);
addElement(26, 'Fe', 'Iron', 55.845, 1.83);
addElement(27, 'Co', 'Cobalt', 58.933194, 1.88);
addElement(28, 'Ni', 'Nickel', 58.6934, 1.91);
addElement(29, 'Cu', 'Copper', 63.546, 1.9);
addElement(30, 'Zn', 'Zinc', 65.38, 1.65);
addElement(31, 'Ga', 'Gallium', 69.723, 1.81);
addElement(32, 'Ge', 'Germanium', 72.63, 2.01);
addElement(33, 'As', 'Arsenic', 74.921595, 2.18);
addElement(34, 'Se', 'Selenium', 78.971, 2.55);
addElement(35, 'Br', 'Bromine', 79.904, 2.96);
addElement(36, 'Kr', 'Krypton', 83.798, 0);
addElement(37, 'Rb', 'Rubidium', 85.4678, 0.82);
addElement(38, 'Sr', 'Strontium', 87.62, 0.95);
addElement(39, 'Y', 'Yttrium', 88.90584, 1.22);
addElement(40, 'Zr', 'Zirconium', 91.224, 1.33);
addElement(41, 'Nb', 'Niobium', 92.90637, 1.6);
addElement(42, 'Mo', 'Molybdenum', 95.95, 2.16);
addElement(43, 'Tc', 'Technetium', 98, 1.9);
addElement(44, 'Ru', 'Ruthenium', 101.07, 2.2);
addElement(45, 'Rh', 'Rhodium', 102.90550, 2.28);
addElement(46, 'Pd', 'Palladium', 106.42, 2.2);
addElement(47, 'Ag', 'Silver', 107.8682, 1.93);
addElement(48, 'Cd', 'Cadmium', 112.414, 1.69);
addElement(49, 'In', 'Indium', 114.818, 1.78);
addElement(50, 'Sn', 'Tin', 118.710, 1.96);
addElement(51, 'Sb', 'Antimony', 121.760, 2.05);
addElement(52, 'Te', 'Tellurium', 127.60, 2.1);
addElement(53, 'I', 'Iodine', 126.90447, 2.66);
addElement(54, 'Xe', 'Xenon', 131.293, 2.6);
addElement(55, 'Cs', 'Caesium', 132.90545196, 0.79);
addElement(56, 'Ba', 'Barium', 137.327, 0.89);
addElement(57, 'La', 'Lanthanum', 138.90547, 1.1);
addElement(58, 'Ce', 'Cerium', 140.116, 1.12);
addElement(59, 'Pr', 'Praseodymium', 140.90766, 1.13);
addElement(60, 'Nd', 'Neodymium', 144.242, 1.14);
addElement(61, 'Pm', 'Promethium', 145, 1.13);
addElement(62, 'Sm', 'Samarium', 150.36, 1.17);
addElement(63, 'Eu', 'Europium', 151.964, 1.2);
addElement(64, 'Gd', 'Gadolinium', 157.25, 1.2);
addElement(65, 'Tb', 'Terbium', 158.92535, 1.1);
addElement(66, 'Dy', 'Dysprosium', 162.500, 1.22);
addElement(67, 'Ho', 'Holmium', 164.93033, 1.23);
addElement(68, 'Er', 'Erbium', 167.259, 1.24);
addElement(69, 'Tm', 'Thulium', 168.93422, 1.25);
addElement(70, 'Yb', 'Ytterbium', 173.054, 1.1);
addElement(71, 'Lu', 'Lutetium', 174.9668, 1.27);
addElement(72, 'Hf', 'Hafnium', 178.49, 1.3);
addElement(73, 'Ta', 'Tantalum', 180.94788, 1.5);
addElement(74, 'W', 'Tungsten', 183.84, 2.36);
addElement(75, 'Re', 'Rhenium', 186.207, 1.9);
addElement(76, 'Os', 'Osmium', 190.23, 2.2);
addElement(77, 'Ir', 'Iridium', 192.217, 2.2);
addElement(78, 'Pt', 'Platinum', 195.084, 2.28);
addElement(79, 'Au', 'Gold', 196.966569, 2.54);
addElement(80, 'Hg', 'Mercury', 200.59, 2);
addElement(81, 'Tl', 'Thallium', 204.38, 2.04);
addElement(82, 'Pb', 'Lead', 207.2, 2.33);
addElement(83, 'Bi', 'Bismuth', 208.98040, 2.02);
addElement(84, 'Po', 'Polonium', 209, 2);
addElement(85, 'At', 'Astatine', 210, 2.2);
addElement(86, 'Rn', 'Radon', 222, 0);
addElement(87, 'Fr', 'Francium', 223, 0.7);
addElement(88, 'Ra', 'Radium', 226, 0.89);
addElement(89, 'Ac', 'Actinium', 227, 1.1);
addElement(90, 'Th', 'Thorium', 232.0377, 1.3);
addElement(91, 'Pa', 'Protactinium', 231.03588, 1.5);
addElement(92, 'U', 'Uranium', 238.02891, 1.38);
addElement(93, 'Np', 'Neptunium', 237, 1.36);
addElement(94, 'Pu', 'Plutonium', 244, 1.28);
addElement(95, 'Am', 'Americium', 243, 1.3);
addElement(96, 'Cm', 'Curium', 247, 1.3);
addElement(97, 'Bk', 'Berkelium', 247, 1.3);
addElement(98, 'Cf', 'Californium', 251, 1.3);
addElement(99, 'Es', 'Einsteinium', 252, 1.3);
addElement(100, 'Fm', 'Fermium', 257, 1.3);
addElement(101, 'Md', 'Mendelevium', 258, 1.3);
addElement(102, 'No', 'Nobelium', 259, 1.3);
addElement(103, 'Lr', 'Lawrencium', 262, null);
addElement(104, 'Rf', 'Rutherfordium', 267, null);
addElement(105, 'Db', 'Dubnium', 268, null);
addElement(106, 'Sg', 'Seaborgium', 271, null);
addElement(107, 'Bh', 'Bohrium', 272, null);
addElement(108, 'Hs', 'Hassium', 270, null);
addElement(109, 'Mt', 'Meitnerium', 276, null);
addElement(110, 'Ds', 'Darmstadtium', 281, null);
addElement(111, 'Rg', 'Roentgenium', 280, null);
addElement(112, 'Cn', 'Copernicium', 285, null);
addElement(113, 'Uut', 'Ununtrium', 284, null);
addElement(114, 'Fl', 'Flerovium', 289, null);
addElement(115, 'Uup', 'Ununpentium', 288, null);
addElement(116, 'Lv', 'Livermorium', 293, null);
addElement(117, 'Uus', 'Ununseptium', 294, null);
addElement(118, 'Uuo', 'Ununoctium', 294, null);