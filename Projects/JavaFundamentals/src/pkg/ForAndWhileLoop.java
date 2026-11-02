package pkg;

import java.util.Scanner;

public class ForAndWhileLoop {
	

	public static void main(String[] args) {
		Scanner usr_prompt = new Scanner(System.in);
		
		String[] months_inwords = {
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"October",
				"September",
				"November",
				"December"
		}; 
		
		
		System.out.print("\n Month: ");
		int month = usr_prompt.nextInt();
		System.out.print("\n Date: ");
		int date = usr_prompt.nextInt();
		System.out.print("\n Year: ");
		int year = usr_prompt.nextInt();
		
		for(int i = 0; i < months_inwords.length; i++) {
			System.out.println(months_inwords[month - 1]+" "+date+", "+year);
		}
		
		usr_prompt.close();
		
	}
	


}
