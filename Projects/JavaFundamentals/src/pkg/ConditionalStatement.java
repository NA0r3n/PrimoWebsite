package pkg;

import java.util.Scanner;

public class ConditionalStatement {

	public static void main(String[] args) {
		
		Scanner s = new Scanner(System.in);
		
		/*
		System.out.print("How old are you? ");
		
		int age = s.nextInt();
		
		boolean LegalAgeGroup;
		
		if(age >= 18) {
			LegalAgeGroup = true;
		} else {
			LegalAgeGroup = false;
		}
		
		if(LegalAgeGroup) {System.out.print("You have Access");}
		else {System.out.print("Access Denied.");}
		*/
		
		float grades[] = {95,95,96,90};
		float average = (grades[0] + grades[1] + grades[2] + grades[3])/4;
		
		if(average >= 75) System.out.println(" Grade: "+average+"\n Passed");
		else { System.out.println(" Grade: "+average+"\n Failed"); }
		
		s.close();
	}
}
