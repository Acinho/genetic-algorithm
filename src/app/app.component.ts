import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  nazivNoveNamirnice: string = '';
  kolicinaNoveNamirnice: number;
  brojKalorijaNoveNamirnice: number;

  dozvoljenaKaloricnaVrednost: number = 2000;
  frizider: Namirnica[] = [
    { naziv: 'Ananas', kolicina: 100, brojKalorija: 95 },
    { naziv: 'Banana', kolicina: 300, brojKalorija: 240 },
    { naziv: 'Jabuka', kolicina: 150, brojKalorija: 60 },
    { naziv: 'Lubenica', kolicina: 200, brojKalorija: 40 },
    { naziv: 'Hleb', kolicina: 300, brojKalorija: 750 },
    { naziv: 'Piletina', kolicina: 300, brojKalorija: 360 },
    { naziv: 'Mleveno meso', kolicina: 300, brojKalorija: 900 },
    { naziv: 'Musaka', kolicina: 500, brojKalorija: 750 },
    { naziv: 'Kobasica', kolicina: 200, brojKalorija: 700 },
    { naziv: 'Svinjetina', kolicina: 300, brojKalorija: 900 },
    { naziv: 'Corba', kolicina: 200, brojKalorija: 200 },
    { naziv: 'Paradajz', kolicina: 200, brojKalorija: 40 },
  ];

  optimalneNamirnice: Namirnica[] = [];

  ukupanBrojKalorija(namirnice: Namirnica[]): string {
    return `Ukupno kalorija: ${namirnice.length ? namirnice.map(x => x.brojKalorija).reduce((x, y) => x + y) : 0}`;
  }

  ukupnaKolicina(namirnice: Namirnica[]): string {
    return `Kolicina: ${namirnice.length ? namirnice.map(x => x.kolicina).reduce((x, y) => x + y) : 0} grama`;
  }

  dodajNamirnicu(namirnica: Namirnica): void {
    if (namirnica.brojKalorija && namirnica.kolicina && namirnica.naziv) {
      this.frizider.push(namirnica);
      this.nazivNoveNamirnice = '';
      this.kolicinaNoveNamirnice = undefined;
      this.brojKalorijaNoveNamirnice = undefined;
    }
  }

  ukloniNamirnicu(index: number): void {
    this.frizider.splice(index, 1);
  }

  generisiRezultat(): void {
    this.optimalneNamirnice.splice(0);
    const populacija = new Populacija(100, this.frizider, this.dozvoljenaKaloricnaVrednost);
    populacija.izracunajFitneseGena();
    const kriterijum = this.dozvoljenaKaloricnaVrednost - 200;
    populacija.evolucija(kriterijum);

    populacija.geni[0].genotip.forEach((x, i) => {
      if (x == 1)
        this.optimalneNamirnice.push(this.frizider[i]);
    });
  }

}

interface Namirnica {
  naziv: string;
  kolicina: number;
  brojKalorija: number;
}

class Gen {
  static readonly verovatnocaKombinacije = 0.8;
  static readonly verovatnocaMutacije = 0.2;

  genotip: (0 | 1)[];
  fitnes: number;
  generacija: number = 0;

  generisiGenotip(namirnice: Namirnica[], dozvoljenaKaloricnaVrednost: number): void {
    this.genotip = Array(namirnice.length).fill(0);
    let ukupnoKalorija: number = 0;
    while (ukupnoKalorija < dozvoljenaKaloricnaVrednost) {
      const indeks: number = Math.floor(Math.random() * (namirnice.length - 1));
      if (this.genotip[indeks] != 1) {
        ukupnoKalorija += namirnice[indeks].brojKalorija;
        if (ukupnoKalorija >= dozvoljenaKaloricnaVrednost)
          break;
        this.genotip[indeks] = 1;
      }
    }
  }

  izracunajFitnes(namirnice: Namirnica[], dozvoljenaKaloricnaVrednost): void {
    const izabraneNamirnice: Namirnica[] = namirnice.filter((x, i) => this.genotip[i] == 1);
    this.fitnes = izabraneNamirnice.length ? izabraneNamirnice.map(x => x.kolicina).reduce((x, y) => x + y) : 0;
    if (!izabraneNamirnice.length || izabraneNamirnice.map(x => x.brojKalorija).reduce((x, y) => x + y) > dozvoljenaKaloricnaVrednost)
      this.fitnes = 0;
  }

  kombinacijaGena(verovatnoca: number, drugiGen: Gen): Gen[] {
    if (verovatnoca >= Math.random()) {
      const tackaPreseka = Math.floor(Math.random() * (this.genotip.length - 1));
      const prviDeoGena1 = this.genotip.slice(0, tackaPreseka);
      const prviDeoGena2 = drugiGen.genotip.slice(0, tackaPreseka);
      const drugiDeoGena1 = this.genotip.slice(tackaPreseka);
      const drugiDeoGena2 = drugiGen.genotip.slice(tackaPreseka);

      const prviPotomak = new Gen();
      const drugiPotomak = new Gen();
      prviPotomak.genotip = prviDeoGena1.concat(drugiDeoGena2);
      drugiPotomak.genotip = prviDeoGena2.concat(drugiDeoGena1);
      return [prviPotomak, drugiPotomak];
    }
    return [this, drugiGen];
  }

  mutacija(verovatnoca: number): void {
    for (let i = 0; i < this.genotip.length; i++)
      if (verovatnoca >= Math.random())
        this.genotip[i] = this.genotip[i] == 1 ? 0 : 1;
  }
}

class Populacija {
  geni: Gen[] = [];
  generacija: number = 0;

  constructor(velicina: number, public namirnice: Namirnica[], public dozvoljenaKaloricnaVrednost: number) {
    for (let i = 0; i < velicina; i++) {
      const gen: Gen = new Gen();
      gen.generisiGenotip(namirnice, dozvoljenaKaloricnaVrednost);
      this.geni.push(gen);
    }
  }

  sortirajGene(): void {
    this.geni.sort((x, y) => y.fitnes - x.fitnes);
  }

  izracunajFitneseGena(): void {
      this.geni.forEach(x => x.izracunajFitnes(this.namirnice, this.dozvoljenaKaloricnaVrednost));
  }

  odaberiRoditelje(): Gen[] {
    this.sortirajGene();
    return [this.geni[0], this.geni[1]];
  }

  evolucija(kriterijum: number): void {
    while (this.geni[0].fitnes < kriterijum && this.generacija < 500) {
      this.generacija++;

      const roditelji: Gen[] = this.odaberiRoditelje();
      const potomci: Gen[] = roditelji[0].kombinacijaGena(Gen.verovatnocaKombinacije, roditelji[1]);

      this.geni.splice(this.geni.length - 2, 2, ...potomci);
      potomci[0].generacija = potomci[1].generacija = this.generacija;

      this.geni.forEach(x => x.mutacija(Gen.verovatnocaMutacije));

      this.izracunajFitneseGena();
      this.sortirajGene();
    }
  }
}
